import {Container} from './components/class.Container.js'; 
import {ContainerItem} from './components/class.ContainerItem.js'; 
import {Text} from './components/class.Text.js'; 
import {Spinner} from './components/class.Spinner.js'; 

export class BusyLoad {
    constructor(caller, defaults, options) { 

        this._settings = defaults;  
        this._caller= caller;

        this.extendSettings(options); 
        // this.debugSettings();
    }
         
    get settings() {
        return this._settings;
    }
  
    set settings(newOptions) {
        this._settings = newOptions; 
    }
           
    get caller() {
        return this._caller;
    }
  
    set caller(newOptions) {
        this._caller = newOptions; 
    }

    debugSettings() {
        console.log(this._settings.fullScreen);
    }

    extendSettings(options) { 
        $.extend(this._settings, options);
    }


    animateShow($tag) {
        let callback = () => $tag.trigger("bl.shown", [$tag, $(this.caller)]);

        this.caller.append($tag); // already hidden
        $tag.trigger("bl.show", [$tag, $(this.caller)]);

        if (_.get(this.settings, "animation",  false)) {

            switch (_.get(this.settings, "animation").toLowerCase()) {
                case "fade": 
                    $tag = $tag.fadeIn(_.get(this.settings, "animationDuration", "fast"), callback);
                    break;
                case "slide":
                    $tag = $tag.slideDown(_.get(this.settings, "animationDuration", "fast"), callback);
                    break;
                default:
                     throw "don't know animation: " +  _.get(this.settings, "animation");
            }
        } else {
            $tag.show(0, callback);
        }

        return $tag;
    } 

    animateHide($tag) { 
        let callback = () => {
            $tag.trigger("bl.hidden", [$tag, $(this.caller)]);
            $tag.remove();
        }

        $tag.trigger("bl.hide", [$tag, $(this.caller)]);

        if (_.get(this.settings, "animation",  false)) {
            switch (_.get(this.settings, "animation").toLowerCase()) {
                case "fade": 
                    $tag = $tag.fadeOut(_.get(this.settings, "animationDuration", "fast"), callback);
                    break;
                case "slide":
                    $tag = $tag.slideUp(_.get(this.settings, "animationDuration", "fast"), callback);
                    break;
                default:
                     throw "don't know animation: " +  _.get(this.settings, "animation");
            }
        } else {
            $tag.hide(0, callback);
        }
    }


    getOverlay() { 
        // already existent?
        if(this._caller.data("busy-load-container")) {
            return $("#"+this._caller.data("busy-load-container"));
        }
        // no ... create one
        else {
            // container & elements
            this._container = new Container(this._settings);
            this._containerItem = new ContainerItem(this._settings);

             
            // append text 
            if (_.get(this.settings, "text",  false)) { 
                this._loadingText= new Text(this._settings);
                this._containerItem.tag.append(this._loadingText.tag); 
            } 
            // append spinner 
            if (_.get(this.settings, "spinner",  "pump") !== false) {
                this._spinner= new Spinner(this._settings); 
                this._containerItem.tag.append(this._spinner.tag);
            } 

            // container
            this._container.tag.append(this._containerItem.tag).hide();
        }

        return this._container.tag;
    } 

    createRandomString() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    toggle($tag, action) { 
        // show
        if(action == 'show') {
            const randomString = this.createRandomString(); 

            $tag.attr('id', randomString);
            $tag = this.animateShow($tag);
 
            this._caller.data("busy-load-container", randomString);
        } 
        // hide
        else {  
            this.animateHide($tag);
            this._caller.removeData("busy-load-container");
        }
    } 

    show() {   
        this.toggle( this.getOverlay(), "show") 
    }

    hide() { 
        const containerId = this._caller.data('busy-load-container');
        this.toggle( $("#"+containerId), "hide" ); 
    }

}
         