from aqt import mw
import requests
from .dev import popup
from .consts import API_URL

def get_today_leaderboard_stats():
    token = mw.NAL_PB['user']['token']
    response = requests.post(f"{API_URL}/update.php")
    popup(str(response.text))