import Container from '../../src/components/container'
import FakePlayback from '../../src/base/playback'
import HTML5Playback from '../../src/playbacks/html5_video/index'
import Playback from '../../src/base/playback'
import Events from '../../src/base/events'

describe('Container', function() {
  beforeEach(function() {
    this.playback = new FakePlayback()
    this.container = new Container({ playback: this.playback })
  })

  it('uses settings from playback', function() {
    expect(this.container.settings).to.deep.equal((new FakePlayback).settings)
  })

  it('gets playback type', function() {
    expect(this.container.getPlaybackType()).to.equal(Playback.NO_OP)
  })

  it('treats the playback as a plugin', function() {
    expect(this.container.plugins[0]).to.equal(this.playback)
  })

  it('gets a plugin by name', function() {
    const plugin = { name: 'fake' }
    this.container.addPlugin(plugin)
    assert.equal(plugin, this.container.getPlugin('fake'))
  })

  it('destroys all the plugins', function() {
    const fakePlugin = { destroy: function() {} }

    sinon.spy(this.playback, 'destroy')
    sinon.spy(fakePlugin, 'destroy')
    sinon.spy(this.container, 'stopListening')
    sinon.spy(this.container, 'trigger')
    sinon.spy(this.container.$el, 'remove')
    this.container.addPlugin(fakePlugin)

    this.container.destroy()

    assert.ok(this.container.trigger.calledWith(Events.CONTAINER_DESTROYED, this.container, this.container.name))
    assert.ok(this.container.stopListening.calledOnce)
    assert.ok(this.playback.destroy.calledOnce)
    assert.ok(fakePlugin.destroy.calledOnce)
    assert.ok(this.container.$el.remove.calledOnce)
  })

  it('update playback options when configure', function() {
    sinon.spy(this.playback, 'configure')
    const fakeOptions = { foo: 'bar' }
    this.container.configure(fakeOptions)

    assert.ok(this.playback.configure.called)
    expect(this.playback.options.foo).to.be.equal(fakeOptions.foo)
  })

  it('listens to playback:progress event', function() {
    sinon.spy(this.container, 'progress')

    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_PROGRESS, { start: 0, current: 3000, total: 6000 })

    assert.ok(this.container.progress.calledWith({ start: 0, current: 3000, total: 6000 }))
  })

  it('listens to playback:timeupdate event', function() {
    sinon.spy(this.container, 'timeUpdated')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_TIMEUPDATE, { current: 2, total: 40 })

    assert.ok(this.container.timeUpdated.calledWith({ current: 2, total: 40 }))
  })

  it('listens to playback:seeked event', function(done) {
    this.timeout(5000)
    let playback = new HTML5Playback({ src: '/base/test/fixtures/SampleVideo_360x240_1mb.mp4' })
    let container = new Container({ playback: playback })
    let callback = sinon.spy()

    container.bindEvents()
    container.on(Events.CONTAINER_SEEKED, callback)
    container.on(Events.CONTAINER_SEEKED, () => {
      assert.ok(callback.called)
      done()
    })

    playback.el.dispatchEvent(new Event('seeked'))
  })

  it('listens to playback:ready event', function() {
    sinon.spy(this.container, 'ready')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_READY)
    assert.ok(this.container.isReady)
    assert.ok(this.container.ready.calledOnce)
  })

  it('listens to playback:buffering event', function() {
    sinon.spy(this.container, 'onBuffering')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_BUFFERING)
    assert.ok(this.container.onBuffering.calledOnce)
  })

  it('listens to playback:bufferfull event', function() {
    sinon.spy(this.container, 'bufferfull')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_BUFFERFULL)
    assert.ok(this.container.bufferfull.calledOnce)
  })

  it('listens to playback:settingsupdate event', function() {
    sinon.spy(this.container, 'settingsUpdate')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_SETTINGSUPDATE)
    assert.ok(this.container.settingsUpdate.calledOnce)
  })

  it('listens to playback:loadedmetadata event', function() {
    sinon.spy(this.container, 'loadedMetadata')

    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_LOADEDMETADATA, { duration: 45, data: { hold: 'on' } })

    assert.ok(this.container.loadedMetadata.calledWith({ duration: 45, data: { hold: 'on' } }))
  })

  it('listens to playback:highdefinitionupdate event', function() {
    const isHD = true
    sinon.spy(this.container, 'highDefinitionUpdate')

    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_HIGHDEFINITIONUPDATE, isHD)

    assert.ok(this.container.highDefinitionUpdate.calledWith(true))
  })

  it('listens to playback:mediacontrol:disable event', function() {
    sinon.spy(this.container, 'disableMediaControl')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_MEDIACONTROL_DISABLE)
    assert.ok(this.container.disableMediaControl.calledOnce)
  })

  it('listens to playback:mediacontrol:enable event', function() {
    sinon.spy(this.container, 'enableMediaControl')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_MEDIACONTROL_ENABLE)
    assert.ok(this.container.enableMediaControl.calledOnce)
  })

  it('listens to playback:ended event', function() {
    sinon.spy(this.container, 'onEnded')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_ENDED)
    assert.ok(this.container.onEnded.calledOnce)
  })

  it('listens to playback:play event', function() {
    sinon.spy(this.container, 'playing')
    this.container.bindEvents()
    this.playback.trigger(Events.PLAYBACK_PLAY)
    assert.ok(this.container.playing.calledOnce)
  })
})
