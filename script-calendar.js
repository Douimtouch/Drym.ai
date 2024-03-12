// script-calendar.js
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

    closeButton.addEventListener('click', function() {
        formContainer.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == formContainer) {
            formContainer.style.display = 'none';
        }
    });

    prevWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 7);
        selectedDateInput.value = currentDate.toISOString().split('T')[0];
        updateCalendar();
        centerSelectedDay();
    });

    nextWeekButton.addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 7);
        selectedDateInput.value = currentDate.toISOString().split('T')[0];
        updateCalendar();
        centerSelectedDay();
    });

    function updateCalendar() {
        calendarContainer.innerHTML = '';
        
        const currentDay = currentDate.getDay();
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(weekStart.getDate() - 6);
        
        if (prevWeekStart < today) {
            prevWeekButton.style.display = 'none';
        } else {
            prevWeekButton.style.display = 'inline';
        }
    

        let daysDisplayed = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            // Vérifier si la date est antérieure à la date actuelle
            if (date < new Date().setHours(0, 0, 0, 0)) {
                continue; // Passer à la prochaine itération de la boucle
            }

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

            let hasTimeSlots = false;

            for (let j = 7; j < 21; j++) {
                for (let k = 0; k < 2; k++) {
                    const now = new Date();
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(j, k * 30);

                    // Vérifier si l'horaire est déjà passé
                    if (slotDateTime >= now) {
                        const timeSlot = document.createElement('div');
                        timeSlot.classList.add('time-slot');
                        let hour = j;
                        let minute = k * 30;
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
                        hasTimeSlots = true;
                    }
                }
            }

            if (hasTimeSlots) {
                daysDisplayed++;
                timeSlotsContainer.appendChild(timeSlots);
                day.appendChild(timeSlotsContainer);
                calendarContainer.appendChild(day);
            }
        }

        calendarContainer.style.gridTemplateColumns = `repeat(${daysDisplayed}, 1fr)`;
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
    
        // Convertir la date sélectionnée en objet Date
        const formattedDate = new Date(selectedDate);
        // Ajouter un jour à la date sélectionnée
        formattedDate.setDate(formattedDate.getDate());
        // Formater la date au format 'YYYY-MM-DD'
        const formattedDateString = formattedDate.toISOString().split('T')[0];
    
        dateInput.value = formattedDateString;
        updateTimeSlots(selectedDate);
        timeInput.value = selectedTime;

        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', function() {
            if (!validatePhoneNumber(phoneInput.value)) {
                phoneInput.setCustomValidity('Veuillez entrer un numéro de téléphone valide (10 chiffres).');
            } else {
                phoneInput.setCustomValidity('');
            }
        });

        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Supprimer les caractères non numériques
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10); // Limiter à 10 chiffres
            }
        });

        phoneInput.addEventListener('keypress', function(event) {
            if (event.keyCode < 48 || event.keyCode > 57) {
                event.preventDefault(); // Empêcher la saisie de caractères non numériques
            }
        });

        formContainer.style.display = 'block';
    }

    function validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phoneNumber);
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
                inline: 'center',
                block: 'end'
            });
        }
    }

    updateCalendar();
    centerSelectedDay();
});

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('fade-in');
});