// script.js
document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();

    const calendarContainer = document.getElementById('calendar-container');
    const selectedDateInput = document.getElementById('selected-date');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const formContainer = document.getElementById('form-container');
    const closeButton = document.querySelector('.close');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');

    selectedDateInput.value = currentDate.toISOString().split('T')[0];
    disablePastDates();
    dateInput.addEventListener('change', disablePastTimeSlots);

    selectedDateInput.addEventListener('change', function() {
        currentDate = new Date(this.value);
        updateCalendar();
        centerSelectedDay();
    });

    prevWeekButton.addEventListener('click', function() {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        if (newDate >= new Date().setHours(0, 0, 0, 0)) {
            currentDate = newDate;
            selectedDateInput.value = currentDate.toISOString().split('T')[0];
            updateCalendar();
            centerSelectedDay();
        }
    });

    nextWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        selectedDateInput.value = currentDate.toISOString().split('T')[0];
        updateCalendar();
        centerSelectedDay();
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
    
        let daysDisplayed = 0;
    
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
    
            // Vérifier si la date est antérieure à la date actuelle
            if (date < new Date().setHours(0, 0, 0, 0)) {
                continue; // Passer à la prochaine itération de la boucle
            }
    
            daysDisplayed++;

            const day = document.createElement('div');
            day.classList.add('day');
            day.dataset.date = date.toISOString().split('T')[0];

            const dayName = document.createElement('div');
            dayName.classList.add('day-name');
            dayName.textContent = `${getDayName(date.getDay())} (${date.toLocaleDateString()})`;
            day.appendChild(dayName);

            const timeSlotsContainer = document.createElement('div');
            timeSlotsContainer.classList.add('time-slots-container');

            const timeSlots = document.createElement('div');
            timeSlots.classList.add('time-slots');

            for (let j = 7; j < 21; j++) {
                for (let k = 0; k < 4; k++) {
                    const now = new Date();
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(j, k * 15);

                    // Vérifier si l'horaire est déjà passé
                    if (slotDateTime >= now) {
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
            }

            calendarContainer.style.gridTemplateColumns = `repeat(${daysDisplayed}, 1fr)`;
            timeSlotsContainer.appendChild(timeSlots);

            day.appendChild(timeSlotsContainer);

            calendarContainer.appendChild(day);
        }
    }

    function openForm(event) {
        const selectedDate = event.target.dataset.date;
        const selectedTime = event.target.dataset.time;

        // Vérifier si l'horaire sélectionné est déjà passé
        const selectedDateTime = new Date(selectedDate + 'T' + selectedTime);
        if (selectedDateTime < new Date()) {
            alert("Vous ne pouvez pas sélectionner un horaire déjà passé.");
            return;
        }

        dateInput.value = selectedDate;
        updateTimeSlots(selectedDate);
        timeInput.value = selectedTime;

        formContainer.style.display = 'block';
    }

    function updateTimeSlots(selectedDate) {
        timeInput.innerHTML = '';

        const selectedDay = document.querySelector(`.day[data-date="${selectedDate}"]`);
        const timeSlots = selectedDay.querySelectorAll('.time-slot');

        timeSlots.forEach(function(timeSlot) {
            const time = timeSlot.dataset.time;
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeInput.appendChild(option);
        });
    }

    function getDayName(dayIndex) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return dayNames[dayIndex];
    }

    function disablePastDates() {
        const today = new Date().toISOString().split('T')[0];
        selectedDateInput.setAttribute('min', today);
        dateInput.setAttribute('min', today);
    }

    function disablePastTimeSlots() {
        const selectedDate = dateInput.value;
        const now = new Date();

        if (selectedDate === now.toISOString().split('T')[0]) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            for (let i = 0; i < timeInput.options.length; i++) {
                const optionValue = timeInput.options[i].value;
                const [hour, minute] = optionValue.split(':');

                if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
                    timeInput.options[i].disabled = true;
                } else {
                    timeInput.options[i].disabled = false;
                }
            }
        } else {
            for (let i = 0; i < timeInput.options.length; i++) {
                timeInput.options[i].disabled = false;
            }
        }
    }

    function centerSelectedDay() {
        const selectedDay = document.querySelector('.day[data-date="' + selectedDateInput.value + '"]');
        if (selectedDay) {
            selectedDay.scrollIntoView({
                behavior: 'smooth',
                inline: 'center'
            });
        }
    }

    updateCalendar();
    centerSelectedDay();
});