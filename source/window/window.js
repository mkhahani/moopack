/**
 *  MooPack Window is a DHTML Window Component based on MooTools
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2014 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     January 27, 2014
 * @url         http://mohsenkhahani.ir/moopack
 *
 * @dependency
 *    - MooTools Core v1.4+
 *    - MooTools More (Element.Position, Drag)
 */


/**
 * MooPack Window base class
 */
MooPack.Window = new Class({

    version: '1.0',

	Implements: [Options, Events],

    /**
     * Default configuration
     */
    options: {
        className       : 'mwindow',
        modal           : true,
        resizable       : false,
        draggable       : true,
        transparentDrag : true,
        escape          : true,
        autoClose       : false,
        showHeader      : true,
        closeButton     : true
    },

    /**
     * Window intializer
     *
     * @access  private
     * @param   object  options Window options
     * @param   string  target  ID of the target element
     * @return  void
     */
    initialize: function (options, target) {
        this.setOptions(options);
        this.className = this.options.className;
        this.focusHandler = this.onLostFocus.bind(this);
        this.escapeHandler = this.onEscape.bind(this);
        this.excludedElements = []; // don't fire onLostFocus() for these elements
        target = (target === undefined)? document.body : $(target);

        if (this.window) {
            this.destroy();
        }
        this.window = this.construct(target);
    },

    /**
     * Window constructor
     *
     * @access  private
     * @param   string  target  ID of the target element
     * @return  string  XHTML window
     */
    construct: function (target) {
        var window = this.buildWindow();

        if (this.options.modal) {
            this.overlay = this.buildOverlay(target);
        }

        if (this.options.showHeader) {
            this.header = this.buildHeader();
            window.grab(this.header);
        }

        this.body = this.buildBody();
        window.grab(this.body);

        if (this.options.closeButton) {
            window.grab(this.buildClose());
        }

        target.grab(window);

        if (this.options.draggable || this.options.resizable) {
            if (typeof Drag === 'undefined') {
                console.warn('could not initiate window dragging.');
            } else {
                if (this.options.draggable) {
                    var handle = this.header? this.header : window,
                        opts = {handle: handle};
                    if (this.options.transparentDrag) {
                        opts.onStart = function(el) {el.addClass('dragging');};
                        opts.onComplete = function(el) {el.removeClass('dragging');};
                    }
                    new Drag(window, opts);
                    handle.addClass('draggable');
                }

                if (this.options.resizable) {
                    var resizer = this.buildResizer();
                    window.grab(resizer);
                    window.makeResizable({
                        handle:resizer,
                        stopPropagation:true
                    });
                }
            }
        }

        return window;
    },

    /**
     * Builds the main window
     *
     * @access  private
     * @return  object  Window element
     */
    buildWindow: function () {
        return new Element('div.' + this.className).hide();
    },

    /**
     * Builds the screen overlay
     *
     * @access  private
     * @return  object  Overlay element
     */
    buildOverlay: function (target) {
        var overlay = new Element('div.' + this.className + '-overlay');
        overlay.style.position = (target === document.body)? 'fixed' : 'absolute';
        overlay.addEvent('mousedown', function (e) {
            if (this.options.autoClose) {
                this.close();
            } else {
                e.stop();
            }
        }.bind(this));
        target.grab(overlay.hide());
        return overlay;
    },

    /**
     * Builds the header of the window
     *
     * @access  private
     * @return  object  Window header element
     */
    buildHeader: function () {
        var header = new Element('div.' + this.className + '-header'),
            title = new Element('div.' + this.className + '-title');
        this.title = title;

        return header.grab(title);
    },

    /**
     * Builds the body of the window
     *
     * @access  private
     * @return  object  Window body element
     */
    buildBody: function () {
        var body = new Element('div.' + this.className + '-body'),
            content = new Element('div.' + this.className + '-content');
        this.content = content;

        return body.grab(content);
    },

    /**
     * Builds the close button
     *
     * @access  private
     * @return  object  Close button element
     */
    buildClose: function () {
        var btnClose = new Element('span.' + this.className + '-close');
        btnClose.addEvent('click', this.close.bind(this));
        btnClose.addEvent('mousedown', function(e) {e.stop();});
        return btnClose;
    },

    /**
     * Builds the resizer area
     *
     * @access  private
     * @return  object  Resizer element
     */
    buildResizer: function () {
        return new Element('div.' + this.className + '-resizer');
    },

    /**
     * Creates some events on document
     *
     * @access  private
     * @return  void
     */
    startDocEvents: function () {
        if (this.options.autoClose) {
            document.addEvent('mousedown', this.focusHandler);
        }
        if (this.options.escape) {
            document.addEvent('keydown', this.escapeHandler);
        }
    },

    /**
     * Removes document events
     *
     * @access  private
     * @return  void
     */
    stopDocEvents: function () {
        document.removeEvent('mousedown', this.focusHandler);
        document.removeEvent('keydown', this.escapeHandler);
    },

    /**
     * Closes the window on ecape key press
     *
     * @access  private
     * @param   object  e   Keybord event
     * @return  void
     */
    onEscape: function (e) {
        if (this.window.isDisplayed() && e.keyCode === Event.KEY_ESC) {
            this.close();
        }
    },

    /**
     * Closes the window when focus is lost on mouse click
     *
     * @access  private
     * @param   object  e   Mouse event
     * @return  void
     */
    onLostFocus: function (e) {
        var el = e.target;
        if (this.window.isDisplayed() && this.window !== el &&
            this.window.getElements('*').indexOf(el) === -1 &&  // => click outside of Window
            this.excludedElements.indexOf(el) === -1)
        {
            this.close();
        }
    },

    /**
     * Sets ID of the window element
     *
     * @access  public
     * @param   string  id  Window ID
     * @return  void
     */
    setId: function (id) {
        this.window.id = id;
    },

    /**
     * Sets title of the window
     *
     * @access  public
     * @param   string  title   Window title
     * @return  void
     */
    setTitle: function (title) {
        if (this.title) {
            this.title.update(title);
        }
    },

    /**
     * Sets content of the window
     *
     * @access  public
     * @param   string  content   XHTML window content
     * @return  void
     */
    setContent: function (content) {
        this.content.update(content);
    },

    /**
     * Sets width & height of the window
     *
     * @access  public
     * @param   int     width   Window width(px)
     * @param   int     height  Window height(px)
     * @return  void
     */
    setSize: function (width, height) {
        this.window.style.width = width + 'px';
        this.window.style.height = height + 'px';
    },

    /**
     * Positions the window
     *
     * @access  private
     * @param   int   x   Window left position (optional)
     * @param   int   y   Window top position (optional)
     * @return  void
     */
    setPosition: function (x, y) {
        if (x === undefined || y === undefined) {
            this.window.position({relativeTo:this.window.parentNode});
        } else {
            this.window.style.left = x + 'px';
            this.window.style.top  = y + 'px';
        }
    },

    /**
     * Displays the window (at the specified position)
     *
     * @access  public
     * @param   int   x   Window left position (optional)
     * @param   int   y   Window top position (optional)
     * @return  void
     */
    open: function (x, y) {
        if (!this.window.style.left) {
            this.setPosition(x, y);
        }
        this.window.show();
        if (this.options.modal) {
            this.overlay.show();
        }
        this.startDocEvents();
        this.fireEvent('window:open');
    },

    /**
     * Hides the window
     *
     * @access  public
     * @return  void
     */
    close: function () {
        this.stopDocEvents();
        this.window.hide();
        if (this.overlay) {
            this.overlay.hide();
        }
        this.fireEvent('window:close');
    },

    /**
     * Opens/Closes the window
     *
     * @access  public
     * @return  void
     */
    toggle: function () {
        if (this.window.isDisplayed()) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Destroys the window
     *
     * @access  public
     * @return  void
     */
    destroy: function () {
        this.window.destroy();
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
    }
});
