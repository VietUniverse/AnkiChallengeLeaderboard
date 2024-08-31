<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="static/profile.css">
    <script>
        function fetchUserProfile() {
            const data = {
                type: 'general',
                username: '<?php echo trim($_GET['username']); ?>'
            };
            const urlEncodedData = new URLSearchParams(data).toString();

            fetch('api/info.php', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: urlEncodedData
            })
                .then(response => response.json())
                .then(data => {
                    tmp = data.time ?? 'none';
                    if (tmp !== 'none') {
                        const user = data;
                        document.getElementById('username').innerText = '<?php echo trim($_GET['username']); ?>';
                        document.getElementById('studyTime').innerText = parseFloat(user.time).toFixed(2) ?? 'none';
                        document.getElementById('cardsReviewed').innerText = user.reviews ?? 'none';
                        document.getElementById('currentStreak').innerText = user.streak_current ?? 'none';
                        document.getElementById('highestStreak').innerText = user.streak_highest ?? 'none';
                        document.getElementById('challengeHighest').innerText = user.challengexp ?? 'none';
                        
                    
                        const fbLinkElement = document.getElementById('fbLink');
                        fbLinkElement.href = user.fb_link || '#';
                        fbLinkElement.innerText = user.fb_link ? 'Visit Facebook Profile' : 'none';
                    } else {
                        alert(data.message || 'Failed to fetch user profile.');
                    }
                })
                .catch(error => console.error('Error fetching user profile:', error));
        }

        window.onload = function() {
            fetchUserProfile();
        };
    </script>
</head>
<body>
    <header>
        <h1 id="profile-heading"><?php echo trim($_GET['username']); ?></h1>
    </header>
    <section class="profile-info">
        <p><strong>Username:</strong> <span id="username"><?php echo trim($_GET['username']); ?></span></p>
        <p><strong>Study Time:</strong> <span id="studyTime"></span> Mins</p>
        <p><strong>Reviewed:</strong> <span id="cardsReviewed"></span></p>
        <p><strong>Current Streak:</strong> <span id="currentStreak"></span></p>
        <p><strong>Highest Streak:</strong> <span id="highestStreak"></span></p>
        <p><strong>Challenge Highest:</strong> <span id="challengeHighest"></span></p>
        <p><strong>Facebook Link:</strong> <a id="fbLink" target="_blank"></a></p>
    </section>
    <section class="actions">
        <button onclick="window.location.href='index.html'">Back to Leaderboard</button>
    </section>
    <footer>
        <p>Made by VietLe & KhiemPham</p>
    </footer>
</body>
</html>