(function () {
  const DELAY = 20000
  let stop

  const NOTIFICATIONS = {
    email: {
      label: 'New email',
      icon: 'https://i.imgur.com/l2wPNdt.png',
    },
    im: {
      label: 'New IM',
      icon: 'https://i.imgur.com/cP3929u.png',
    },
    calendar: {
      label: 'Calendar event reminder',
      icon: 'https://i.imgur.com/LIgx1T9.png',
    },
    warning: {
      icon: 'https://i.imgur.com/eBBqf3C.png',
    },
    error: {
      icon: 'https://i.imgur.com/ygMJiaF.png',
    },
    system: {
      label: 'Some system event',
      icon: 'https://i.imgur.com/zDX7V1w.png',
    },
    notification: {
      label: 'New notification',
      icon: 'https://i.imgur.com/ZMBLwBY.png',
    },
  }

  function halt(error) {
    console.error(error)
    showNotification('error', {label: error})
    stop()
    throw new Error(error)
  }

  function throwUnsupportedVersionError(version) {
    halt(`Unsupported OWA version: ${version}`)
  }

  function showNotification(type, options = {}) {
    if (Notification.permission === 'granted') {
      createNotification(type, options)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
          createNotification(type, options)
        }
      })
    }
  }

  function createNotification(type, opts = {}) {
    const {label, icon} = NOTIFICATIONS[type]
    const text = 'Outlook Web App: ' + (opts.label || label)
    const options = {
      icon,
    }
    console.log('Notification', text, options)
    return new Notification(text, options)
  }

  function start(context) {
    console.log(`OWA version: ${context.rawOwaVersion}`)

    function isIgnored(numberEl) {
      if (!context.ignoredFolders) {
        return false
      }

      const folderEl = numberEl.parentNode.parentNode.querySelector(context.folderNameQuery)
      const favFolderEl = numberEl.parentNode.parentNode.querySelector(context.favFolderNameQuery)
      const folderName = (folderEl || favFolderEl).innerText
      if (context.ignoredFolders.indexOf(folderName) !== -1) {
        return true
      }

      return false
    }

    function anyNewEmails() {
      const emailCountQuery = context.emailCountQuery
      if (!emailCountQuery) {
        return throwUnsupportedVersionError(context.rawOwaVersion)
      }

      const numberEls = document.querySelectorAll(emailCountQuery)
      if (!numberEls.length) {
        return throwUnsupportedVersionError(context.rawOwaVersion)
      }

      for (const numberEl of numberEls) {
        const textContent = numberEl.textContent.trim()
        if (!textContent) {
          continue
        }
        if (isIgnored(numberEl)) {
          continue
        }
        return true
      }

      return false
    }

    function anyNewEvents() {
      const unseenEventCountEls = [].slice.call(document.querySelectorAll('.o365cs-flexPane-unseenCount'), 0)
      const shownUnseenEventCountEls = unseenEventCountEls.filter(x => x.style.display !== 'none')
      if (shownUnseenEventCountEls.length) {
        return 'notification'
      }
      return false
    }

    const interval = setInterval(function () {
      const event = anyNewEvents()
      if (event) {
        showNotification(event)
      }
      if (event !== 'email' && anyNewEmails(context)) {
        showNotification('email')
      }
    }, DELAY)

    return function () {
      clearInterval(interval)
    }
  }

  function getContext() {
    const metaContent = document.querySelector('meta[name="msapplication-TileImage"]').getAttribute('content')
    const versionString = metaContent.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/g)[0]

    const versionParts = versionString.split('.')
    const owaVersion = `${versionParts[0]}.${versionParts[1].substr(0, 1)}`

    const EMAIL_COUNT_QUERY = {
      '16.2': '[id$=".folder"] + div > span',
      '15.1': '[id$=".folder"] + div > span',
    }

    const IGNORED_FOLDERS = {
      '16.2': ['Drafts', 'Черновики'],
      '15.1': ['Drafts', 'Черновики'],
    }

    const FOLDER_NAME_QUERY = {
      '16.2': '[id$=".folder"]',
      '15.1': '[id$=".folder"]',
    }

    const FAV_FOLDER_NAME_QUERY = {
      '16.2': '[id$=".folder"]',
      '15.1': '[id$=".folder"]',
    }

    return {
      rawOwaVersion: versionString,
      owaVersion: owaVersion,
      [owaVersion]: true,
      emailCountQuery: EMAIL_COUNT_QUERY[owaVersion],
      ignoredFolders: IGNORED_FOLDERS[owaVersion],
      folderNameQuery: FOLDER_NAME_QUERY[owaVersion],
      favFolderNameQuery: FAV_FOLDER_NAME_QUERY[owaVersion],
    }
  }

  setTimeout(function() {
    stop = start(getContext())
  }, DELAY)
}())
