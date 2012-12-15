/**
 *  MooPack DropDown, a DHTML drop-down plugin for Mootools
 *  © 2012 Mohsen Khahani
 *
 *  Licensed under the MIT license
 *  Created on December 11, 2012
 *
 *  http://mohsen.khahani.com/moopack
 */


/**
 * MooPack DropDown base class
 */
MooPack.DropDown = new Class({

    version: '1.0dev',

	Implements: Options,

    options: {
        baseClass : 'moopack-dropdown',
        editable  : false,
        buttonType: 'disabled'  // [disabled, visible, smart]
    },

    initialize: function (target, options) {
        this.setOptions(options);
		Object.append(this, {
            baseClass : this.options.baseClass,
            editable  : this.options.editable,
            buttonType: this.options.buttonType
        });
        this.element = this.construct();
        if (target) {
            try {
                $(target).grab(this.element);
                this.prepare();
            } catch (err) {
                throw new Error('The target element was not found.');
            }
        }
    },

    toElement: function() {
        return this.element;
    },

    construct: function() {
        var element  = new Element('div', {'class': this.baseClass});
        this.entry = this.buildEntry();
        element.grab(this.entry);
        if (this.buttonType !== 'disabled') {
            this.button = this.buildButton(element);
            element.grab(this.button);
        }
        this.drawer = this.buildDrawer();
        element.grab(this.drawer);
        return element;
    },

    buildEntry: function() {
        var entry = new Element('input', {type: 'text'});
        if (!this.editable) {
            entry.set({readonly: true});
        }
        if (this.buttonType === 'smart') {
            entry.addEvent('mousedown', function() {this.button.hide();}.bind(this));
        }
        entry.addEvent('mousedown', this.onEntryClick.bind(this));

        return entry;
    },

    buildButton: function (element) {
        var button = new Element('button');
        if (this.buttonType === 'smart') {
            button.hide();
            element.addEvent('mouseover', function() {button.show();}.bind(this));
            element.addEvent('mouseout', function() {button.hide();}.bind(this));
        }
        button.addEvent('click', this.onButtonClick.bind(this));

        return button;
    },

    buildDrawer: function() {
        var drawer = new Element('div', {'class': this.baseClass + '-drawer'}).hide(),
            events = {
                mouseover: function() {this.hasFocus = true;}.bind(this),
                mouseout : function() {this.hasFocus = false;}.bind(this)
            };
        drawer.addEvents(events);
        document.addEvent('click', this.onLostFocus.bind(this));

        return drawer;
    },

    onEntryClick: function (e) {
        if (!e.rightClick) {
            this.drawer.toggle();
            // entry not selectable
            e.stop();
        }
    },

    onButtonClick: function (e) {
        this.drawer.toggle();
        //Event.stop(e);
    },

    onLostFocus: function (e) {
        var el = e.target;
        if (el !== this.entry && !this.hasFocus) {
            this.drawer.hide();
        }
    },

    prepare: function() {
        if (Element.equalize) {
            if (this.drawer.offsetWidth < this.entry.offsetWidth) {
                this.drawer.equalize(this.entry, ['width', 'margin']);
            }
            this.drawer.setStyle('margin-top', -this.entry.getStyle('margin-top').toInt() + 'px');
            if (this.buttonType !== 'disabled') {
                this.button.equalize(this.entry, ['height']);
            }
        }
    },

//=================================================================================================
// API
//=================================================================================================
    setId: function(id) {
        this.entry.id = id;
    },

    setValue: function(value) {
        this.entry.value = value;
    },

    open: function() {
        this.drawer.show();
    },

    close: function() {
        this.drawer.hide();
    }
});
