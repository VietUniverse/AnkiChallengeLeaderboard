VERSION = "0.1.1"
APP_NAME = "AnkiChallengeLeaderboard"
SHORT_APP_NAME = "Challenge_LB"


import os

ADDON_NAME = "1371172900"

def get_addon_folder():
    base_path = os.path.join(os.path.dirname(__file__), "..", "..", "addons21")
    addon_folder = os.path.join(base_path, ADDON_NAME)
    if os.path.exists(addon_folder):
        return addon_folder
    return None

ADDON_FOLDER = get_addon_folder()

DEV_MODE = ADDON_FOLDER.endswith("dev") if ADDON_FOLDER else False
API_URL = "https://leaderboard.ankivn.com/api/"
LEADERBOARD_WEBSITE = "https://leaderboard.ankivn.com/"
GITHUB_URL = "https://github.com/VietHacker/AnkiChallengeLeaderboard/issues/"
DEV_MODE = True

