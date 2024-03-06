// script.js
document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();

    const calendarContainer = document.getElementById('calendar-container');
    const selectedDateInput = document.getElementById('selected-date');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const formContainer = document.getElementById('form-container');
    const closeButton = document.querySelector('.close');

    selectedDateInput.value = currentDate.toISOString().split('T')[0];
    disablePastDates();

    selectedDateInput.addEventListener('change', function() {
        currentDate = new Date(this.value);
        updateCalendar();
    });

    prevWeekButton.addEventListener('click', function() {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        if (newDate >= new Date().setHours(0, 0, 0, 0)) {
            currentDate = newDate;
            selectedDateInput.value = currentDate.toISOString().split('T')[0];
            updateCalendar();
        }
    });

    nextWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 7);
        selectedDateInput.value = currentDate.toISOString().split('T')[0];
        updateCalendar();
    });

    closeButton.addEventListener('click', function() {
        formContainer.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == formContainer) {
            formContainer.style.display = 'none';
        }
    });

    function updateCalendar() {
        calendarContainer.innerHTML = '';

        const currentDay = currentDate.getDay();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            // Vérifier si la date est antérieure à la date actuelle
            if (date < new Date().setHours(0, 0, 0, 0)) {
                continue; // Passer à la prochaine itération de la boucle
            }

            const day = document.createElement('div');
            day.classList.add('day');

            const dayName = document.createElement('div');
            dayName.classList.add('day-name');
            dayName.textContent = `${getDayName(date.getDay())} (${date.toLocaleDateString()})`;
            day.appendChild(dayName);

            const timeSlotsContainer = document.createElement('div');
            timeSlotsContainer.classList.add('time-slots-container');

            const timeSlots = document.createElement('div');
            timeSlots.classList.add('time-slots');

            for (let j = 0; j < 24; j++) {
                for (let k = 0; k < 4; k++) {
                    const timeSlot = document.createElement('div');
                    timeSlot.classList.add('time-slot');
                    let hour = j;
                    let minute = k * 15;
                    if (hour < 10) {
                        hour = '0' + hour;
                    }
                    if (minute === 0) {
                        minute = '00';
                    }
                    const time = `${hour}:${minute}`;
                    timeSlot.textContent = time;
                    timeSlot.dataset.date = date.toISOString().split('T')[0];
                    timeSlot.dataset.time = time;
                    timeSlot.addEventListener('click', openForm);
                    timeSlots.appendChild(timeSlot);
                }
            }

            timeSlotsContainer.appendChild(timeSlots);

            day.appendChild(timeSlotsContainer);

            calendarContainer.appendChild(day);
        }
    }

    function openForm(event) {
        const selectedDate = event.target.dataset.date;
        const selectedTime = event.target.dataset.time;

        document.getElementById('date').value = selectedDate;
        document.getElementById('time').value = selectedTime;

        formContainer.style.display = 'block';
    }

    function getDayName(dayIndex) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return dayNames[dayIndex];
    }

    function disablePastDates() {
        const today = new Date().toISOString().split('T')[0];
        selectedDateInput.setAttribute('min', today);
    }

    updateCalendar();
});
