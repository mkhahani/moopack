/**
 * MooPack Tabs is a DHTML Tabs Component based on MooTools
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2014 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     February 30, 2014
 * @url         http://mohsenkhahani.ir/moopack
 *
 * @dependency
 *    - MooTools Core v1.4+
 */


/**
 * MooPack Tabs base class
 */
MooPack.Tabs = new Class({

    version: '1.0',

	Implements: [Options, Events],

    /**
     * Default configuration
     */
    options: {
        className: 'mtabs',
        findTabs: true,
        hover: false,
        defaultTab: 1
    },

    /**
     * Tabs intializer
     *
     * @access  private
     * @param   mixed   target  Container element/ID
     * @param   object  options
     * @return  Clss instance of Tabs
     */
    initialize: function (target, options) {
        if (!$(target)) {
            throw new Error('MooPack.Tabs.initialize(): Could not find target element "' + target + '".');
        }
        this.setOptions(options);
        this.target = $(target);
        if (this.options.findTabs) { this.construct(); }
    },

    /**
     * Builds tabs
     *
     * @access  private
     * @return  void
     */
    construct: function () {
        var links = this.target.getElements('li a');
        this.tabs = this.target.getElements('li').addClass(this.options.className + '-tab');
        this.sheets = links.map(function (link) { return $(link.rel); });
        links.invoke('addEvent', 'click', this.switchTab.bind(this));
        if (this.options.hover) {
            links.invoke('addEvent', 'mouseover', this.switchTab.bind(this));
        }
        this.reset();
        this.setActive(this.options.defaultTab);
        this.target.addClass(this.options.className);
    },

    /**
     * Creates tabs by passed tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    createTabs: function (tabs) {
        var ul = new Element('ul').addClass(this.options.className);
        this.sheets = tabs.map(function (tab) {return $(tab[0]);});
        this.tabs = tabs.map(function (tab) {
            var a = new Element('a', {rel:tab[0]}).update(tab[1]),
                li = new Element('li').grab(a);
            a.addEvent('click', this.switchTab.bind(this));
            if (this.options.hover) {
                a.addEvent('mouseover', this.switchTab.bind(this));
            }
            li.addClass(this.options.className + '-tab');
            ul.grab(li);
            return li;
        }.bind(this));
        return ul;
    },

    /**
     * Switches to the clicked/hovered tab
     *
     * @param   object  e   mouse event (click or mouseover)
     */
    switchTab: function (e) {
        var link = e.target;
        this.reset();
        $(link.rel).show();
        link.getParent('li').addClass('active');
        this.fireEvent('tabs:change', link.rel);
    },

    /**
     * Deselects tabs and hides all sheets
     */
    reset: function () {
        this.sheets.invoke('hide');
        this.tabs.invoke('removeClass', 'active');
    },

    /**
     * Creates tabs by passing tabs data
     *
     * @param   array   tabs [[id1, title1], [id2, title2], ...]
     */
    setTabs: function (tabs) {
        this.target.grab(this.createTabs(tabs), 'top');
        this.reset();
        this.setActive(this.options.defaultTab);
    },

    /**
     * Selects a tab and displays related sheet
     *
     * @param   integer index   tab index, begins from 1
     */
    setActive: function (index) {
        this.reset();
        this.tabs[index - 1].addClass('active');
        this.sheets[index - 1].show();
        this.fireEvent('tabs:change', this.tabs[index - 1].getElement('a').rel);
    }
});
