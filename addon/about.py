from aqt.qt import *

class AboutWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle("About AnkiChallengeLeaderboard")
        self.resize(400, 200)

        layout = QVBoxLayout()
        
        text = QLabel(
            f"<h2>AnkiChallengeLeaderboard</h2>"
            f"<p>Version 0.1.1</p>"
            f"<p>Author: VietLe & KhiemPham</p>"
            f"<p>This addon integrates Anki with AnkiChallengeLeaderboard.</p>"
        )
        layout.addWidget(text)
        
        button_close = QPushButton("Close")
        button_close.clicked.connect(self.close)
        layout.addWidget(button_close)
        
        self.setLayout(layout)
