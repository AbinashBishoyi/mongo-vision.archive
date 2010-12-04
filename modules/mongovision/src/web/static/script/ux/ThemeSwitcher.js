//
// Copyright 2010 Three Crickets LLC.
//
// The contents of this file are subject to the terms of the Apache License
// version 2.0: http://www.opensource.org/licenses/apache2.0.php
// 
// Alternatively, you can obtain a royalty free commercial license with less
// limitations, transferable or non-transferable, directly from Three Crickets
// at http://threecrickets.com/
//

//
// Ext.ux.ThemeSwitcher
//
// A ComboBox that allows switching between a set of CSS stylesheets.
//
// If the 'statefulThemeId' config option is not null, the theme selection is stored in the
// state.Manager and switched to automatically when the component is created.
//
// A LoadMask is used while loading. Use the 'loadingText' config option for the LoadMask text.
//
// The optional 'layoutContainers' config option specifies one of or an array of container
// component IDs that will have their layout redone after the switch. When this is used, an
// extra delay added to allow the browser time to re-render after switching. Change this delay
// time with the 'delay' config option. The default is 2000 ms.
//
// The 'themes' config option is an array of themes, where each theme is an array in
// form of ['theme', 'label']. The 'themeBase' config option is prefixed to each 'theme' in
// order to create the stylesheet URL.
//
// The 'styleSheets' config option is one of or an array ID of the <link> elements
// in the page header. An example of such an element:
//
// <head>
//   <link rel="stylesheet" type="text/css" href="style/ext/css/xtheme-blue.css" id="ext-theme" />
// </head>
//

Ext.namespace('Ext.ux');

Ext.ux.ThemeSwitcher = Ext.extend(Ext.form.ComboBox, {
	constructor: function(config) {
		this.mask = new Ext.LoadMask(Ext.getBody(), {msg: config.loadingText});
		
		this.addEvents({
			switched: true
		});

		var store = new Ext.data.ArrayStore({
			fields: ['theme', 'label'],
			data: config.themes
		});

		// A theme may have been stored in the state
		var currentTheme = config.statefulThemeId ? Ext.state.Manager.get(config.statefulThemeId) : null;
		var firstTheme = store.getAt(0).get('theme');
		
		config = Ext.apply({
			mode: 'local',
			store: store,
			valueField: 'theme',
			displayField: 'label',
			value: currentTheme || firstTheme,
			triggerAction: 'all',
			editable: false,
			forceSelection: true,
			delay: 2000
		}, config);
		
		config.listeners = Ext.apply({
			select: function(combo, record) {
				this.doSwitch(record.get('theme'));
			}.createDelegate(this)
		}, config.listeners);
		
		Ext.ux.ThemeSwitcher.superclass.constructor.call(this, config);
		
		if (currentTheme && (currentTheme != firstTheme)) {
			this.doSwitch(currentTheme);
		}
	},
	
	doSwitch: function(theme) {
		// Show the LoadMask while switching
		this.mask.show();

		Ext.each(this.styleSheets, function(styleSheet) {
			var url = styleSheet[1] + this;
			Ext.util.CSS.swapStyleSheet(styleSheet[0], url);
		}, theme);
		
		if (this.statefulThemeId) {
			// Store the theme in the state
			Ext.state.Manager.set(this.statefulThemeId, theme);
		}
		
		if (this.layoutContainers) {
			// Wait a few seconds after swapping the style sheet, so that
			// the browser can finish rendering, and only then redo the layout
			// to account for size changes after rendering
			
			(function(url) {
				Ext.each(this.layoutContainers, function() {
					Ext.getCmp(this).doLayout(false, true);
				});

				this.mask.hide();
				this.fireEvent('switched', theme);
			}).defer(this.delay, this, [theme]);
		}
		else {
			this.mask.hide();
			this.fireEvent('switched', theme);
		}
	}
});

Ext.reg('themeswitcher', Ext.ux.ThemeSwitcher);