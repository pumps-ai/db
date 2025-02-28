import math
import numpy as np
import tkinter as tk
from tkinter import ttk


class PumpCalculatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("db优化计算1.0")

        # 设置窗口大小和图标
        self.root.geometry("400x600")
        self.set_window_icon()

        # 定义常量和默认值
        self.pi_value = math.pi
        self.default_values = {
            "Q": 160.0, "H": 110.0, "N": 2750.0, "STAGE": 1.00,
            "DENSITY": 1.00, "ROUGH": 3.65, "SUCTION": 1, "POWF": 1.05
        }
        self.labels = {
            "Q": "流量 (M³/H)", "H": "扬程 (M)", "N": "转速 (RPM)", "STAGE": "级数",
            "DENSITY": "密度", "ROUGH": "铸造表面(μm)", "SUCTION": "吸入方式", "POWF": "电机安全系数"
        }

        # 初始化UI组件
        self.entries = {}
        self.results = {
            "first_stage": tk.StringVar(),
            "eff_stage": tk.StringVar(),
            "second_stage": tk.StringVar(),
            "max_eff_stage": tk.StringVar()
        }

        self.setup_ui()
        self.update_results()  # 初始计算

    def set_window_icon(self):
        """设置窗口图标为'db'"""
        try:
            icon = tk.PhotoImage(width=16, height=16)
            icon.put("white", to=(0, 0, 15, 15))  # 背景
            icon.put("black", to=(2, 2, 13, 13))  # "db"文字区域
            icon.put("white", to=(4, 4, 11, 11))  # 文字反白
            self.root.iconphoto(True, icon)
        except Exception as e:
            print(f"设置图标失败: {e}")

    def setup_ui(self):
        """设置用户界面"""
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")

        # 输入区域
        for i, (key, value) in enumerate(self.default_values.items()):
            ttk.Label(main_frame, text=self.labels[key]).grid(row=i, column=0, padx=5, pady=5, sticky='e')
            entry = ttk.Entry(main_frame)
            entry.grid(row=i, column=1, padx=5, pady=5, sticky='ew')
            entry.insert(0, str(value))
            self.entries[key] = entry

        # 结果显示区域
        row_offset = len(self.default_values)
        ttk.Label(main_frame, text="计算结果").grid(row=row_offset, column=0, columnspan=2, pady=10)
        ttk.Label(main_frame, textvariable=self.results["first_stage"]).grid(row=row_offset + 1, column=0, columnspan=2)
        ttk.Label(main_frame, textvariable=self.results["eff_stage"], foreground="red").grid(row=row_offset + 2,
                                                                                             column=0, columnspan=2)

        ttk.Label(main_frame, text="最优参考").grid(row=row_offset + 3, column=0, columnspan=2, pady=10)
        ttk.Label(main_frame, textvariable=self.results["second_stage"]).grid(row=row_offset + 4, column=0,
                                                                              columnspan=2)
        ttk.Label(main_frame, textvariable=self.results["max_eff_stage"], foreground="red").grid(row=row_offset + 5,
                                                                                                 column=0, columnspan=2)

        # 计算按钮
        ttk.Button(main_frame, text="计算", command=self.update_results).grid(row=row_offset + 6, column=0,
                                                                              columnspan=2, pady=10)

        # 设置网格权重
        main_frame.grid_columnconfigure(1, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

    def get_values(self):
        """获取输入值并转换为浮点数"""
        try:
            return {key: float(entry.get()) for key, entry in self.entries.items()}
        except ValueError:
            return self.default_values  # 如果转换失败，使用默认值

    def calculate_constants(self, values):
        """计算基本常数"""
        qqq = values["Q"] / values["SUCTION"] / 3600
        rads = values["N"] * 2 * self.pi_value / 60
        X = (3.5 / values["ROUGH"]) ** 2
        return qqq, rads, X

    def calculate_eff(self, stage, values, qqq, rads, X):
        """计算效率"""
        hhh = values["H"] / stage
        OS = qqq ** 0.5 * rads / (9.81 * hhh) ** 0.75
        eff2 = 0.011378 * (qqq / values["N"] * X) ** (-0.21333)
        eff3 = 0.29 * math.log10(0.8364 / OS) ** 2
        return max(0, 0.94 - eff2 - eff3)  # 确保效率不为负

    def calculate_ns(self, stage, values, qqq):
        """计算Ns值"""
        hhh = values["H"] / stage
        return values["N"] * qqq ** 0.5 / hhh ** 0.75

    def update_results(self):
        """更新计算结果"""
        values = self.get_values()
        qqq, rads, X = self.calculate_constants(values)

        # 当前级数计算
        given_stage = values["STAGE"]
        eff_given = self.calculate_eff(given_stage, values, qqq, rads, X)
        ns_given = self.calculate_ns(given_stage, values, qqq)
        HW = values["Q"] * values["H"] / 360 * values["DENSITY"]
        HWF = HW / eff_given * values["POWF"]

        self.results["first_stage"].set(f"HYD POWER: {HW:.2f}\nPOWER: {HWF:.2f}")
        self.results["eff_stage"].set(f"EFF: {eff_given * 100:.2f}%\nNs: {ns_given:.4f}")

        # 寻找最佳级数
        best_stage, best_eff = given_stage, eff_given
        for stage in np.arange(0.1, 100.0, 0.1):  # 调整步长以提高性能
            eff = self.calculate_eff(stage, values, qqq, rads, X)
            if eff > best_eff:
                best_eff, best_stage = eff, stage

        ns_best = self.calculate_ns(best_stage, values, qqq)
        self.results["second_stage"].set(f"Optimal STAGE: {best_stage:.2f}\nNs: {ns_best:.4f}")
        self.results["max_eff_stage"].set(f"Maximum EFF: {best_eff * 100:.2f}%")


def main():
    root = tk.Tk()
    app = PumpCalculatorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()