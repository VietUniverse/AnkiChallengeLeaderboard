from aqt import mw
from aqt.qt import *
from .dev import popup
from .consts import LEADERBOARD_WEBSITE, GITHUB_URL, DEV_MODE, API_URL, ADDON_FOLDER
import requests
import os
import json

def setup_menu():
    menu = None
    add_menu = False

    for i in mw.form.menubar.actions():
        if i.text() == "Leaderboard":
            menu = i.menu()
            menu.clear()
    
    if not menu:
        menu = QMenu("Leaderboard", mw)
        add_menu = True
    
    open_lb_action = QAction("Open Leaderboard", mw)
    def open_lb():
        url = QUrl(LEADERBOARD_WEBSITE)
        QDesktopServices.openUrl(url)
    qconnect(open_lb_action.triggered, open_lb)
    menu.addAction(open_lb_action)

    if hasattr(mw, 'NAL_PB') and mw.NAL_PB and mw.NAL_PB.get('user'):
        show_profile_action = QAction("Show Profile", mw)
        def show_profile():
            url = QUrl(LEADERBOARD_WEBSITE + 'profile' + mw.NAL_PB['user']['id'])
            QDesktopServices.openUrl(url)
        qconnect(show_profile_action.triggered, show_profile)
        menu.addAction(show_profile_action)
        
        META_PATH = os.path.join(mw.addonManager.addonsFolder(),f"{ADDON_FOLDER}", "meta.json")

        logout_action = QAction("Logout", mw)
        def logout():
            response = requests.post(f"{API_URL}", data={"logout": True})
            if response.status_code == 200:
                mw.NAL_PB = None
                if os.path.exists(META_PATH):
                    with open(META_PATH, "r") as meta_file:
                        meta_data = json.load(meta_file)

                    if "config" in meta_data:
                        del meta_data["config"]
                        popup("Logout Successful")

                    with open(META_PATH, "w") as meta_file:
                        json.dump(meta_data, meta_file, indent=4)

                setup_menu()
            else:
                popup("Logout failed")
        qconnect(logout_action.triggered, logout)
        menu.addAction(logout_action)

    else:
        login_action = QAction("Login", mw)
        def show_login_dialog():
            from .login import LoginDialog
            mw.loginWidget = LoginDialog()
            mw.loginWidget.show()
        qconnect(login_action.triggered, show_login_dialog)
        menu.addAction(login_action)
        
        register_action = QAction("Register", mw)
        def open_register():
            url = QUrl(LEADERBOARD_WEBSITE + '/register')
            QDesktopServices.openUrl(url)
        qconnect(register_action.triggered, open_register)
        menu.addAction(register_action)

    issue_action = QAction("Report a Bug", mw)
    def on_issue_action():
        log_short = []
        if hasattr(mw, 'NAL_LOG'):
            for line in mw.NAL_LOG:
                line = line[line.find(": ")+2:]
                log_short.append(line)
        
        issue_body = f"Describe your issue:\n\nDebug log:\n```\n{'%0A'.join(log_short)}\n```"
        url = QUrl(GITHUB_URL + f"issues/new?labels=bug&body={issue_body}")
        QDesktopServices.openUrl(url)
    qconnect(issue_action.triggered, on_issue_action)
    menu.addAction(issue_action)
    
    about_action = QAction("About", mw)
    def on_about_action():
        from .about import AboutWindow
        mw.aboutWidget = AboutWindow()
        mw.aboutWidget.show()
    qconnect(about_action.triggered, on_about_action)
    menu.addAction(about_action)
    
    if DEV_MODE:
        debug_action = QAction("Debug", mw)
        def on_debug_action():
            from .anki_stats import get_today_leaderboard_stats
            s = get_today_leaderboard_stats()
            popup(f"Current streak: {s}")
        
        qconnect(debug_action.triggered, on_debug_action)
        menu.addAction(debug_action)

    if add_menu:
        mw.form.menubar.insertMenu(mw.form.menuTools.menuAction(), menu)
