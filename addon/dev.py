from aqt import mw
from aqt.qt import QMessageBox

def popup(message):
    QMessageBox.information(mw, "AnkiChallengeLeaderboard", message)

def error():
    QMessageBox.critical(mw, "AnkiChallengeLeaderboard Error", "An error occurred. Check the logs for more details.")

def info(message):
    QMessageBox.information(mw, "AnkiChallengeLeaderboard Info", message)
