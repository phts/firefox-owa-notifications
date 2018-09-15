'use strict'

let silentMode = false

function toggle() {
  silentMode = !silentMode
  setIcon(`button-${silentMode ? 'off-' : ''}32`)
  sync({silentMode})
}

function onConnect() {
  sync({silentMode})
}

function sync(obj) {
  browser.tabs.query({
    url: 'https://*/owa/*',
  }).then(tabs => {
    tabs.forEach(tab => {
      browser.tabs.sendMessage(tab.id, obj)
    })
  })
}

function setIcon(icon) {
  const path = `icons/${icon}.png`
  browser.browserAction.setIcon({
    path,
  })
}

browser.browserAction.onClicked.addListener(toggle)

browser.runtime.onConnect.addListener(onConnect)
