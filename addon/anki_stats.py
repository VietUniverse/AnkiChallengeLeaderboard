from aqt import mw
import requests
from .dev import popup

def get_today_leaderboard_stats():
    token = mw.NAL_PB['user']['token']
    response = requests.post("https://leaderboard.ankivn.com/api/update.php")
    popup(str(response.text))