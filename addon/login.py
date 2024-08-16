from aqt import mw
from aqt.qt import *
from .dev import popup, error
import requests
from .consts import API_URL, ADDON_NAME
from .menu import setup_menu
from .sync import sync_data

class LoginDialog(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle('AnkiChallengeLeaderBoard Login')
        self.resize(500, 120)

        layout = QGridLayout()

        label_name = QLabel('<font size="4"> Username </font>')
        self.lineEdit_username = QLineEdit()
        self.lineEdit_username.setPlaceholderText('Please enter your username')
        layout.addWidget(label_name, 0, 0)
        layout.addWidget(self.lineEdit_username, 0, 1)

        label_password = QLabel('<font size="4"> Password </font>')
        self.lineEdit_password = QLineEdit()
        self.lineEdit_password.setPlaceholderText('Please enter your password')
        self.lineEdit_password.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addWidget(label_password, 1, 0)
        layout.addWidget(self.lineEdit_password, 1, 1)

        button_login = QPushButton('Login')
        qconnect(button_login.clicked, self.on_login_user)
        layout.addWidget(button_login, 2, 0, 1, 2)
        layout.setRowMinimumHeight(2, 75)

        self.setLayout(layout)

    def on_login_user(self):
        user = self.lineEdit_username.text()
        password = self.lineEdit_password.text()
        
        try:
            login_user(user, password)
        except Exception as e:
            error(f"Login failed: {e}")
            print(f"Exception: {e}")

def login_user(user, password) -> None:
    try:
        response = requests.post(
            f"{API_URL}/login.php",
            data={"username": user, "password": password}
        )

        print(f"Response Status Code: {response.status_code}")
        print(f"Response Content: {response.content}")

        if response.status_code == 200:
            user_data = response.json()

            if 'user' in user_data and isinstance(user_data['user'], dict) and 'token' in user_data['user']:
                mw.NAL_PB = user_data
                popup("Login Successful")

                config = mw.addonManager.getConfig(f"{ADDON_NAME}")
                config["username"] = user
                config["token"] = mw.NAL_PB['user']['token']
                mw.addonManager.writeConfig(f"{ADDON_NAME}", config)

                mw.loginWidget.close()
                setup_menu()
                sync_data()
            else:
                popup("Login Failed: User Data is not valid!")
                mw.NAL_PB = None
        else:
            popup("Login Failed: " + response.text)
            mw.NAL_PB = None
    except Exception as e:
        popup(f"Error Occured: {str(e)}")
        mw.NAL_PB = None

def auto_login():
    config = mw.addonManager.getConfig(f"{ADDON_NAME}")

    user = config.get("username", None)
    token = config.get("token", None)
    if user and token:
            mw.NAL_PB = {"user": {"username": user, "token": token}}
            setup_menu()
    else:
        mw.loginWidget = LoginDialog()
        mw.loginWidget.show()
