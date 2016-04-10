var nums = [];
for (var i = 0; i <= 60; i++) {
    nums.push(i);
}

var en = {
    register: {
        doctitle: 'Flysolo registration',
        label: {
            name: 'Name',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            repassword: 'Re-password'
        },
        placeholder: {
            name: 'Enter your name',
            username: 'Enter username',
            email: 'Enter your email',
            password: 'Enter password',
            repassword: 'Retype password'
        },
        btnText: 'Register',
        no_account: 'Dont\'t have an account?'
    },
    login: {
        doctitle: 'Flysolo login',
        label: {
            username: 'Username',
            password: 'Password'
        },
        placeholder: {
            username: 'Enter username',
            password: 'Enter password'
        },
        btnText: 'Login'
    },
    message: {
        error: 'Error',
        success: 'Success',
        warning: 'Warning'
    },
    request: {
        invalid: 'Invalid request'
    },
    time: {
        am: 'AM',
        pm: 'PM',
        hr: 'Hour',
        hrs: 'Hours',
        min: 'Minute',
        mins: 'Minutes',
        sec: 'Second',
        secs: 'Seconds',
        day: 'Day',
        days: 'Days',
        week: 'Week',
        weeks: 'Weeks',
        month: 'Month',
        months: 'Months',
        year: 'Year',
        years: 'Years',
        weekday: {
            sun: 'Sunday',
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Satday'
        },
        month_names: {
            jan: 'January',
            feb: 'Febraury',
            mar: 'March',
            apr: 'April',
            may: 'May',
            jun: 'June',
            jul: 'July',
            aug: 'August',
            sep: 'September',
            oct: 'October',
            nov: 'November',
            dec: 'December'
        },
        last_week: 'Last week',
        last_month: 'Last month',
        last_year: 'Last year'
    },
    i18: {
        ago: 'ago',
        create: 'Create',
        create_job: 'Create a job',
        edit: 'Edit',
        trash: 'Trash',
        remove: 'Remove',
        delete: 'Delete'
    },
    number: nums,
    number_literals: [
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine'
    ],
    messages: {
        event_title_required: 'Event title is required.',
        event_start_date_required: 'Event start date is required.',
        event_end_date_required: 'Event end date is required.',
        event_location_required: 'Event location is required.',
        event_description_required: 'Event description is required.',
        data_not_email: 'Entered data is not a valid email.',
        event_start_date_invalid: 'Event start date is invalid.',
        event_end_date_invalid: 'Event end date is invalid.',
        event_start_greater_end: 'Start date is greater than end date.'
    },
    email: {
        subject: {
            event_invitation: 'Event invitation'
        }
    }
};

module.exports = en;