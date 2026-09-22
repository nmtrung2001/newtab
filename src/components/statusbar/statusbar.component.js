
// Statusbar component for tab navigation and widgets
class Statusbar extends Component {
  externalRefs = {};

  refs = {
    categories: ".categories ul",
    tabs: "#tabs ul li",
    indicator: ".indicator",
    fastlink: ".fastlink",
  };

  currentTabIndex = 0;

  /**
   * Initialise the statusbar component
   */
  constructor() {
    super();

    this.setDependencies();
  }

  /**
   * Sets up component dependencies and external references
   */
  setDependencies() {
    this.externalRefs = {
      categories: this.parentNode.querySelectorAll(this.refs.categories),
    };
  }

  /**
   * Returns CSS import dependencies for this component
   * @returns {string[]} Array of CSS file paths
   */
  imports() {
    return [this.getResource('icons', 'material'), this.getResource('libs', 'awoo')];
  }

  /**
   * Generates component CSS styles
   * @returns {string} CSS styles for the statusbar
   */
  style() {
    return `
      *:not(:defined) { display: none; }

      #tabs,
      #tabs .widgets,
      #tabs ul li:last-child {
          position: absolute;
      }

      #tabs {
          width: 100%;
          height: 100%;
      }

      #tabs ul {
          counter-reset: tabs;
          height: 100%;
          position: relative;
          list-style: none;
          margin-left: 1em;
      }

      #tabs ul li:not(:last-child)::after {
          content: counter(tabs, cjk-ideographic);
          counter-increment: tabs;
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          align-items: center;
          text-align: center;
          justify-content: center;
      }

      #tabs ul li:not(:last-child) {
          width: 35px;
          text-align: center;
          font: 700 13px 'Yu Gothic', serif;
          color: ${CONFIG.palette.text};
          padding: 6px 0;
          transition: all .1s;
          cursor: pointer;
          line-height: 0;
          height: 100%;
      }

      #tabs ul li:not(:last-child):hover {
          background: ${CONFIG.palette.surface0};
      }

      #tabs ul li:last-child {
          --flavour: var(--accent);
          position: absolute;
          width: 35px;
          height: 3px;
          background: var(--flavour);
          bottom: 0;
          left: 0;
          transform: translateX(calc(var(--active-tab-index, 0) * 35px));
          transition: all .3s;
      }

      #tabs ul li[active]:not(:last-child) {
          color: ${CONFIG.palette.text};
          font-size: 13px;
          padding: 6px 0;
      }

      .widgets {
          right: 0;
          margin: auto;
          height: 32px;
          color: #fff;
          font-size: 12px;
      }

      .widgets:hover .edit {
          margin: 0;
      }

      .widget {
          position: relative;
          height: 100%;
          padding: 0 1em;
      }

      .widget.time-widget {
          min-width: max-content;
      }

      .widget:first-child {
          padding-left: 2em;
      }

      .widget:last-child {
          padding-right: 2em;
      }

      .widget:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, .05);
      }

      #tabs > cols {
          position: relative;
          grid-template-columns: [chat-tab] 35px [tabs] auto [widgets] auto;
      }

      #tabs .time span {
          font-weight: 400;
      }

      #tabs i {
          font-size: 14pt !important;
      }

      .widget:not(:first-child)::before {
          content: '';
          position: absolute;
          display: block;
          left: 0;
          height: calc(100% - 15px);
          width: 1px;
          background: rgb(255 255 255 / 10%);
      }

      .fastlink {
          border: 0;
          background: ${CONFIG.palette.mantle};
          color: ${CONFIG.palette.green};
          cursor: pointer;
          border-radius: 5px 15px 15px 5px;
      }

      .fastlink:hover {
          filter: brightness(1.2);
      }

      .fastlink-icon {
        width: 70%;
      }
    `;
  }

  /**
   * Generates HTML template for the statusbar component
   * @returns {string} HTML template with tabs and widgets
   */
  template() {
    return `
        <div id="tabs">
            <cols>
                <button class="+ fastlink">
                  <img class="fastlink-icon" src="src/img/favicon.png"/>
                </button>
                <ul class="- indicator"></ul>
                <div class="+ widgets col-end">
                    <current-time class="+ widget time-widget"></current-time>
                    <weather-forecast class="+ widget weather"></weather-forecast>
                </div>
            </cols>
        </div>`;
  }

  /**
   * Sets up event listeners for tab interactions and navigation
   */
  setEvents() {
    this.refs.tabs.forEach((tab) => (tab.onclick = ({ target }) => this.handleTabChange(target)));

    document.onkeydown = (e) => this.handleKeyPress(e);
    document.onwheel = (e) => this.handleWheelScroll(e);
    this.refs.fastlink.onclick = () => {
      if (CONFIG.fastlink) window.location.href = CONFIG.fastlink;
    };

    // Store current tab index before page unload
    if (CONFIG.openLastVisitedTab) {
      window.onbeforeunload = () => this.saveCurrentTab();
    }
  }

  /**
   * Saves the currently active tab index to localStorage
   */
  saveCurrentTab() {
    localStorage.lastVisitedTab = this.currentTabIndex;
  }

  /**
   * Opens the last visited tab from localStorage
   */
  openLastVisitedTab() {
    if (!CONFIG.openLastVisitedTab) return;
    this.activateByKey(localStorage.lastVisitedTab);
  }

  /**
   * Handles tab change events
   * @param {Element} tab - The clicked tab element
   */
  handleTabChange(tab) {
    this.activateByKey(Number(tab.getAttribute("tab-index")));
  }

  /**
   * Handles mouse wheel scrolling for tab navigation
   * @param {WheelEvent} event - The wheel event object
   */
  handleWheelScroll(event) {
    if (!event) return;
    const { target, wheelDelta } = event;
    if (target.shadow && target.shadow.activeElement) return;
    const tabCount = this.externalRefs.categories.length;
    const nextIndex = wheelDelta > 0 ? (this.currentTabIndex + 1) % tabCount : (this.currentTabIndex - 1 + tabCount) % tabCount;
    this.activateByKey(nextIndex);
  }

  /**
   * Handles keyboard shortcuts for tab navigation
   * @param {KeyboardEvent} event - The keyboard event object
   */
  handleKeyPress(event) {
    if (!event) return;

    const { target, code, shiftKey, ctrlKey, altKey, metaKey,
    } = event;

    if (target.shadow && target.shadow.activeElement) return;
    if (ctrlKey || altKey || metaKey) return;

    const tabCount = this.externalRefs.categories.length;

    if (code === "ArrowRight" || code === "ArrowDown" || code === "ArrowLeft" || code === "ArrowUp") {
      const movingForward = code === "ArrowRight" || code === "ArrowUp";
      const nextIndex = movingForward ? (this.currentTabIndex + 1) % tabCount : (this.currentTabIndex - 1 + tabCount) % tabCount;
      event.preventDefault();
      this.activateByKey(nextIndex);
      return;
    }

    const match = code.match(/^(?:Digit|Numpad)([0-9])$/);
    if (!match) return;
    const digit = Number(match[1]);
    const tabNumber = shiftKey ? digit === 0 ? 20 : digit + 10 : digit === 0 ? 10 : digit;
    const tabIndex = tabNumber - 1;
    if (tabIndex >= 0 && tabIndex < tabCount) {
      event.preventDefault();
      this.activateByKey(tabIndex);
    }
  }

  /**
   * Activates a tab by its index
   * @param {number} key - The tab index to activate
   */
  activateByKey(key) {
    const tabCount = this.externalRefs.categories.length;

    if (!Number.isInteger(key) || key < 0 || key >= tabCount) {
      return;
    }

    this.currentTabIndex = key;

    this.activate(this.refs.tabs, this.refs.tabs[key]);
    this.activate(
      this.externalRefs.categories,
      this.externalRefs.categories[key]
    );

    const indicator = this.refs.tabs[this.refs.tabs.length - 1];

    indicator.style.setProperty("--active-tab-index", key);
  }


  /**
   * Creates tab elements based on categories count
   */
  createTabs() {
    const categoriesCount = this.externalRefs.categories.length;
    this.refs.indicator.innerHTML = "";
    for (let i = 0; i < categoriesCount; i++) {
      const tab = document.createElement("li");
      tab.setAttribute("tab-index", i);
      if (i === 0) {
        tab.setAttribute("active", "");
      }
      this.refs.indicator.appendChild(tab);
    }
    // Add the indicator as the final <li>
    const indicator = document.createElement("li");
    indicator.style.setProperty("--active-tab-index", this.currentTabIndex);
    this.refs.indicator.appendChild(indicator);
  }

  /**
   * Activates a specific item by setting active attribute
   * @param {NodeList} target - Collection of elements to process
   * @param {Element} item - The specific item to activate
   */
  activate(target, item) {
    target.forEach((i) => i.removeAttribute("active"));
    item.setAttribute("active", "");
  }

  /**
   * Component lifecycle callback when element is connected to DOM
   */
  connectedCallback() {
    this.render().then(() => {
      this.createTabs();
      this.setEvents();
      this.openLastVisitedTab();
    });
  }
}
