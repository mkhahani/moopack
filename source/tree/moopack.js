/**
 * MooPack is set of DHTML UI plugins for MooTools JS framework
 * © 2012-2014 Mohsen Khahani
 *
 * Licensed under the MIT license
 * http://mohsenkhahani.ir/moopack
 */


/**
 * Checks the existance of the MooTools
 */
if (typeof MooTools === 'undefined') {
    throw('MooPack requires MooTools JavaScript framework 1.4+');
}

var MooPack = MooPack || {
    version: '1.0dev'
};

/**
 * Sets width/height of the element same as the givven element
 * 
 * @param   element el       Source element
 * @param   array   options  ['width', 'height', 'margin']
 * @return  void
 */
Element.implement({
    update: function(content) {
        if (typeof content === 'string') {
            this.set('html', content);
        } else {
            this.set('html', '').grab(content);
        }
        return this;
    },

    equalize: function(el, options) {
        var size = el.getSize(),
            measure = this.getComputedSize();
        options = options || [];

        if (options.contains('width')) {
            this.setStyle('width', size.x - measure.computedLeft - measure.computedRight + 'px');
        }
        if (options.contains('height')) {
            this.setStyle('height', size.y - measure.computedTop - measure.computedBottom + 'px');
        }
        if (options.contains('margin')) {
            this.setStyle('margin', el.getStyle('margin'));
        }
    }
});

Array.implement({
    pluck: function(prop){
        return this.map(function(item){
            return item[prop];
        });
    },

    partition: function(iterator, context) {
        iterator = iterator || function(x) {return x;};
        var trues = [], falses = [];
        this.each(function(value, index) {
            (iterator.call(context, value, index) ?
                trues : falses).push(value);
        });
        return [trues, falses];
    }
});
