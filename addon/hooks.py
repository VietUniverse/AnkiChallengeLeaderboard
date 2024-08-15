from aqt import mw, gui_hooks
from .dev import info, popup, error
from .sync import sync_data
from .login import auto_login

def on_load():
    """Kiểm tra và thông báo về các huy chương mới khi mở profile."""
    

def on_anki_sync():
    """Đồng bộ dữ liệu sau khi Anki hoàn tất đồng bộ hóa."""
    try:
        sync_data()
    except Exception as e:
        info(f"Đã xảy ra lỗi khi đồng bộ hóa số lượt đánh giá. Xem log để biết chi tiết.")
        error()

def on_token_refreshed(success):
    """Xử lý khi token của người dùng được làm mới."""
    if not success:
        popup("Làm mới token người dùng thất bại. Vui lòng đăng nhập lại.")
        mw.NAL_PB = None
        setup_menu()

def setup_hooks():
    """Thiết lập các hook cần thiết cho addon."""
    gui_hooks.sync_did_finish.append(on_anki_sync)
    gui_hooks.profile_did_open.append(on_load)
    gui_hooks.profile_did_open.append(auto_login)
