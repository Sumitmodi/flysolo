var conf = {
    session_name: 'ioesandeep',
    port: 8000
};

var config = {
    google: {
        apikey: '',
        clientID: '651382622287-1nppefuc3r8t9ua5brd1un7r9ufmi861.apps.googleusercontent.com',
        clientSecret: 'bWuw8J2u7DCJqVIPNtXZMaVc',
        returnURL: 'http://localhost:' + conf.port + '/login/success/google',
        domain: 'http://localhost:' + conf.port + '/'
    },
    dropbox: {
        apikey: 'i1cmj2wtbs68wue',
        appSecret: 'nk82hmqh82flgg8',
        returnURL: 'http://localhost:' + conf.port + '/login/success/dropbox'
    },
    mail: {
        service: "gmail",
        smtp: {
            username: 'cesarzeppini@gmail.com',
            password: 'password'
        }
    },
    imap: {
        gmail: {
            user: 'ioesandeep@gmail.com',
            password: 'Palhi123',
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            ssl: true
        },
        office365: {
            user: 'email',
            password: 'password',
            host: 'outlook.office365.com',
            port: 993,
            tls: true,
            ssl: true
        },
        yahoo: {
            user: 'email',
            password: 'password',
            host: 'imap.mail.yahoo.com',
            port: 993,
            tls: true,
            ssl: true
        },
        outlook: {
            user: 'email',
            password: 'password',
            host: 'imap-mail.outlook.com',
            port: 993,
            tls: true,
            ssl: true
        },
        hotmail: {
            user: 'email',
            password: 'password',
            host: 'imap-mail.outlook.com',
            port: 993,
            tls: true,
            ssl: true
        },
        aol: {
            user: 'email',
            password: 'password',
            host: 'imap.aol.com',
            port: 993,
            tls: true,
            ssl: true
        },
        user: 'cesarzeppini@gmail.com',
        password: 'password',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        ssl: true
    }
};

for (var key in conf) {
    config[key] = conf[key];
}

module.exports = config;