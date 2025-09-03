document.addEventListener('DOMContentLoaded', function() {
    loadUserStats();
    loadDocumentStats();
    loadCommunicationStats();
    updateSessionTime();
    animateCharts();
    setupSupportForm();
    loadRecentActivities();
});

async function loadUserStats() {
    try {
        const sessionCookie = document.cookie.split(';').find(c => c.trim().startsWith('session='));
        if (!sessionCookie) return;

        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));

        const usernameElement = document.getElementById('prenom-user');
        if (usernameElement) {
            usernameElement.textContent = `Bienvenue, ${sessionData.username}`;
        }

        const roleElement = document.querySelector('.stat-card:nth-child(4) .stat-title');
        if (roleElement && sessionData.role) {
            roleElement.textContent = `Rôle: ${sessionData.role}`;
        }
    } catch (error) {
        console.error('Erreur chargement stats utilisateur:', error);
    }
}

async function loadDocumentStats() {
    try {
        const response = await fetch('/files');
        if (!response.ok) throw new Error('Erreur récupération documents');

        const files = await response.json();

        const docsUploadedElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (docsUploadedElement) {
            docsUploadedElement.textContent = files.length;
        }

        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

        const docsTrendElement = document.querySelector('.stat-card:nth-child(2) .stat-trend');
        if (docsTrendElement) {
            docsTrendElement.innerHTML = `<i class="fas fa-hdd"></i> ${totalSizeMB} MB au total`;
        }

        updateActivityChart(files);
    } catch (error) {
        console.error('Erreur chargement stats documents:', error);
    }
}

function updateActivityChart(files) {
    const dayCount = [0, 0, 0, 0, 0, 0, 0];

    files.forEach(file => {
        const date = new Date(file.date);
        const day = date.getDay();
        dayCount[day]++;
    });

    const maxCount = Math.max(...dayCount);
    const bars = document.querySelectorAll('.chart-bar');

    if (bars.length === 7) {
        bars.forEach((bar, index) => {
            const dataIndex = (index + 1) % 7;
            const percentage = maxCount > 0
                ? Math.max(5, (dayCount[dataIndex] / maxCount) * 100)
                : 5;
            bar.style.height = `${percentage}%`;
            bar.dataset.count = dayCount[dataIndex];
            bar.title = `${dayCount[dataIndex]} document(s)`;
        });
    }
}

async function loadCommunicationStats() {
    try {
        const response = await fetch('/emails?page=1&q=');
        if (!response.ok) throw new Error('Erreur récupération emails');

        const data = await response.json();
        const totalEmails = data.totalPages * 8;

        const emailsElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (emailsElement) {
            emailsElement.textContent = totalEmails;
        }

        const emailTrendElement = document.querySelector('.stat-card:nth-child(1) .stat-trend');
        if (emailTrendElement && data.communications.length > 0) {
            const latestEmail = data.communications[0];
            const date = new Date(latestEmail.date);
            const formattedDate = date.toLocaleDateString();
            emailTrendElement.innerHTML = `<i class="fas fa-calendar"></i> Dernier: ${formattedDate}`;
        }

        updateClientContactStats(data.communications);
    } catch (error) {
        console.error('Erreur chargement stats communications:', error);
    }
}

function updateClientContactStats(communications) {
    const clientCounts = {};

    communications.forEach(comm => {
        clientCounts[comm.user] = (clientCounts[comm.user] || 0) + 1;
    });

    const sortedClients = Object.entries(clientCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const clientListElement = document.querySelector('.client-list');
    if (clientListElement && sortedClients.length > 0) {
        clientListElement.innerHTML = '';

        sortedClients.slice(0, 5).forEach(client => {
            const clientItem = document.createElement('div');
            clientItem.className = 'client-item';
            clientItem.innerHTML = `
                <div class="client-name">${client.name}</div>
                <div class="client-value">${client.count} message(s)</div>
            `;
            clientListElement.appendChild(clientItem);
        });
    }
}

function updateSessionTime() {
    let sessionStart = localStorage.getItem('sessionStart');
    if (!sessionStart) {
        sessionStart = Date.now();
        localStorage.setItem('sessionStart', sessionStart);
    }

    const sessionTimeCard = document.querySelector('.stat-card:nth-child(3)');
    if (!sessionTimeCard) return;

    const sessionTimeValue = sessionTimeCard.querySelector('.stat-value');
    updateTime();
    setInterval(updateTime, 60000);

    function updateTime() {
        const now = Date.now();
        const elapsedMs = now - sessionStart;
        const elapsedMinutes = Math.floor(elapsedMs / 60000);
        const hours = Math.floor(elapsedMinutes / 60);
        const minutes = elapsedMinutes % 60;

        sessionTimeValue.textContent = `${hours}h ${minutes}m`;
    }
}

async function loadRecentActivities() {
    try {
        const [filesResponse, emailsResponse] = await Promise.all([
            fetch('/files'),
            fetch('/emails?page=1&q=')
        ]);

        const files = await filesResponse.json();
        const emails = await emailsResponse.json();

        const activities = [];

        files.forEach(file => {
            activities.push({
                type: 'document',
                icon: 'fa-file-upload',
                title: 'Document téléversé',
                description: file.name,
                time: new Date(file.date)
            });
        });

        emails.communications.forEach(email => {
            activities.push({
                type: 'email',
                icon: 'fa-envelope',
                title: 'Email envoyé',
                description: `À: ${email.destinataire}, Sujet: ${email.sujet}`,
                time: new Date(email.date)
            });
        });

        activities.sort((a, b) => b.time - a.time);

        const activityListElement = document.querySelector('.activity-list');
        if (activityListElement && activities.length > 0) {
            activityListElement.innerHTML = '';

            activities.slice(0, 4).forEach(activity => {
                const now = new Date();
                let timeText;

                const diffMs = now - activity.time;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                if (diffDays > 0) {
                    timeText = diffDays === 1 ? 'Hier' : `Il y a ${diffDays} jours`;
                } else if (diffHours > 0) {
                    timeText = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
                } else if (diffMins > 0) {
                    timeText = `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
                } else {
                    timeText = 'À l\'instant';
                }

                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                    </div>
                    <div class="activity-time">${timeText}</div>
                `;
                activityListElement.appendChild(activityItem);
            });
        }
    } catch (error) {
        console.error('Erreur chargement activités récentes:', error);
    }
}

function animateCharts() {
    const bars = document.querySelectorAll('.chart-bar');

    bars.forEach((bar, index) => {
        const targetHeight = bar.style.height;
        bar.style.height = '0%';

        setTimeout(() => {
            bar.style.height = targetHeight;
        }, index * 100);
    });
}

function setupSupportForm() {
    const supportForm = document.querySelector('.support-form');
    const submitButton = supportForm.querySelector('button');

    submitButton.addEventListener('click', function(e) {
        e.preventDefault();

        const subjectInput = supportForm.querySelector('input[type="text"]');
        const descriptionInput = supportForm.querySelector('textarea');

        if (!subjectInput.value.trim() || !descriptionInput.value.trim()) {
            alert('Veuillez remplir tous les champs du formulaire.');
            return;
        }

        alert('Votre problème a été signalé avec succès. L\'équipe de support vous contactera sous peu.');

        subjectInput.value = '';
        descriptionInput.value = '';
    });
}
