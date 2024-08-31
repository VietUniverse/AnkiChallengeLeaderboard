from aqt import mw
from .hooks import setup_hooks
from .menu import setup_menu
from .login import auto_login
import os
from .consts import ADDON_NAME

def get_addon_folder():
    """Lấy tên thư mục addon từ cấu hình của Anki"""
    addon_folder = mw.addonManager.addonFolder()
    full_addon_path = os.path.join(addon_folder, f"{ADDON_NAME}")
    return full_addon_path

auto_login()
setup_hooks()
setup_menu()