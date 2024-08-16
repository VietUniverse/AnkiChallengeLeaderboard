import requests
from aqt import mw
from .consts import API_URL
from .dev import popup, error
from datetime import datetime, timedelta

def sync_data():
    if not hasattr(mw, "NAL_PB") or mw.NAL_PB is None or "user" not in mw.NAL_PB:
        popup("User not logged in")
        return

    user_token = mw.NAL_PB["user"]["token"]
    try:
        cards_data = gather_cards_data()
        time_data = gather_time_data()
        review_data = gather_review_right()

        if time_data == 0 or cards_data == 0:
            popup("You haven't studied today")
            return
        
        retention = ((review_data) / cards_data) * 100 if cards_data > 0 else 0
        xp_data = "%0.2f"%(((time_data / 1440)*100) * ((2 * review_data) + (time_data * retention)))
        response = requests.post(
            f"{API_URL}/update.php",
            data={
                "type": "leaderboard",
                "token": user_token,
                "cards": cards_data,
                "reviews": review_data,
                "time": "%0.2f"%(time_data),
                "xp_today": xp_data,
                "retention": "%0.2f"%(retention),
            }
        )

    except Exception as e:
        popup(f"An error occurred during sync: {str(e)}")
        error()

def gather_cards_data():
    try:
        query = """
        SELECT COUNT(*) FROM revlog
        WHERE id >= strftime('%s', 'now', 'start of day', 'utc') * 1000
        AND id < strftime('%s', 'now', 'start of day', '+1 day', 'utc') * 1000;
        """
        results = mw.col.db.execute(query)
        num_cards = results[0][0] if results else 0
        return num_cards
    except Exception as e:
        popup(f"Error gathering cards data: {e}")
        return 0

def gather_time_data():
    start_of_today = datetime.combine(datetime.now().date(), datetime.min.time())
    end_of_today = start_of_today + timedelta(days=1)
    start_timestamp = int(start_of_today.timestamp() * 1000)
    end_timestamp = int(end_of_today.timestamp() * 1000)

    try:
        query = """
        SELECT time FROM revlog
        WHERE id >= ? AND id < ?
        """
        rows = mw.col.db.all(query, start_timestamp, end_timestamp)

        total_time = 0

        for row in rows:
            total_time += row[0]
            
        minutes_difference = total_time / 60000
        return minutes_difference

    except Exception as e:
        mw.showInfo(f"An error occurred: {e}")
        return 0


def gather_review_right():
    start_of_today = datetime.combine(datetime.now().date(), datetime.min.time())
    end_of_today = start_of_today + timedelta(days=1)
    start_timestamp = int(start_of_today.timestamp() * 1000)
    end_timestamp = int(end_of_today.timestamp() * 1000)

    try:
        query = """
        SELECT COUNT(*) FROM revlog
        WHERE id >= ? AND id < ?
        AND (type = 0 OR type = 1 OR type = 3)
        AND factor >= 2300
        """
        results = mw.col.db.execute(query, start_timestamp, end_timestamp)
        
        num_reviews = results[0][0] if results else 0

        return num_reviews

    except Exception as e:
        mw.show_info(f"Error gathering review data: {e}")
        return 0