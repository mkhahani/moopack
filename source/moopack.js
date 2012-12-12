/**
 * MooPack is set of DHTML UI plugins for MooTools JS framework
 * © 2012 Mohsen Khahani
 *
 * Licensed under the MIT license
 * http://mohsen.khahani.com/moopack
 */


/**
 * Checks the existance of the MooTools
 */
if (typeof MooTools === 'undefined') {
    throw('MooPack requires MooTools JavaScript framework 1.4+');
}

var MooPack = {};

/**
 * Sets width/height of the element same as the givven element
 * 
 * @param   element el       Source element
 * @param   array   options  ['width', 'height', 'margin']
 * @return  void
 */
Element.implement({
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
