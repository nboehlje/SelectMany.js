class SelectMany { 
    constructor(config) {
        this.selectEl = config.element; 
        // assign data source callback 
        this.formatDataSrc = config.dataSrc;
        this.controller = null; 
       
        // resize the search menu to match the base select element
        const resizeObserver = new ResizeObserver((entries) => {
            const elementWidth = entries[0].borderBoxSize[0].inlineSize; 
            this.searchMenu.style.width = elementWidth + "px";
        })
        resizeObserver.observe(this.selectEl); 
   
        // when the select element is clicked -> show the search menu and hide the select element
        this.selectEl.addEventListener('click', () => {  
            this.selectEl.style.visibility = 'hidden';
            this.searchMenu.hidden = false; 
            this.inputEl.focus(); 
        })
        // create a flexbox to wrap everything
        this.containerEl = document.createElement('div')
        this.containerEl.style.position = 'relative'; 
        // wrap the select element 
        this.selectEl.parentNode.replaceChild(this.containerEl, this.selectEl); 
        this.containerEl.appendChild(this.selectEl);  

        this.searchMenu = this.createElementBtr('div', { 
            hidden: 'hidden',
            class: 'border rounded bg-white search-menu'
        }); 
        this.selectEl.after(this.searchMenu);
        
        // set the "placeholder" to be visible when the search menu is open
        // "placeholer" in this context is an solo option element that is selected 
        let displayText = this.selectEl.options[this.selectEl.selectedIndex].text; 
        this.selectDisplay = this.createElementBtr('div', {
            class: 'Select-Many', 
            text: displayText
        }); 
        this.searchMenu.appendChild(this.selectDisplay); 
        
        this.selectArea = this.createElementBtr('div', {
            class: 'p-3 pt-1'
        }); 
        this.searchMenu.appendChild(this.selectArea); 

        this.inputEl = this.createElementBtr('input', {
            class: 'form-control mb-2',
            type: 'text'
        });  
        
        this.selectArea.appendChild(this.inputEl); 
        this.selectBox = this.createElementBtr('div', {
            class: 'list-group list-group-flush select-box'
        }); 
        this.inputEl.after(this.selectBox);

        this.inputEl.addEventListener('input', (event) => {
            const searchVal = this.inputEl.value.toLowerCase();  
            if (this.ajaxProps) { 
                if (searchVal === "")  { 
                    this.clearSearchResults(); 
                    return; 
                }
                this.getRemoteData(this.ajaxProps, searchVal)
                    .then((data) => {
                        if (data === "request_aborted") {
                            return;
                        }
                        this.data = this.formatDataSrc(data); 
                        this.createSearchResults(this.data); 
                    }); 
            } else {
                const searchResults = this.data.filter(item => item.text.toLowerCase().includes(searchVal));
                this.createSearchResults(searchResults); 
            }
        })

        this.inputEl.addEventListener('focusout', (event) => {
            const relTarget = event.relatedTarget; 
            if (relTarget) { 
                const isOption = relTarget.classList.contains('select-opt-btn'); 
                if (isOption) { 
                    event.stopPropagation(); 
                    event.preventDefault(); 
                    return; 
                }
            }
            this.selectEl.style.visibility = "visible"; 
            this.searchMenu.hidden = true; 
        })

        if (config.remoteData) {
            this.ajaxProps = config.remoteData; 
        } else if (config.localData) {
            if (this.formatDataSrc) { 
                this.data = this.formatDataSrc(config.localData) 
            } else {
                this.data = config.localData; 
            }
            this.createSearchResults(this.data); 
        }
    }
    async getRemoteData(ajaxProps, searchVal) {
        try {
            if (this.controller) {
                this.controller.abort();
            } else {
                this.displayLoadingMsg();
            }
            this.controller = new AbortController();
            const signal = this.controller.signal;
            const url = new URL(ajaxProps.url); 
            url.searchParams.append("searchVal", searchVal); 
            
            return await fetch(url.href, { signal, ajaxProps })
                .then(response => { 
                    this.controller = null; 
                    return response.json(); 
                })

        } catch(err) {
            if (err.name == 'AbortError') {
                return 'request_aborted';
            } else {
                throw err;
            }
        }
    }
    clearSearchResults() {
        this.selectBox.innerHTML = ""; 
    }
    createSearchResults(results) { 
        this.clearSearchResults();
        if (results.length == 0) {
            this.displayNoResultsMsg();
        } else {
            for (let item of results) {
                let option = this.createElementBtr('button', {
                    type: 'button',
                    value: item.value, 
                    class: 'list-group-item list-group-item-action select-opt-btn', 
                    text: item.text,
                    original_item: item
                }); 

                option.addEventListener('click', () => {
                    let selectedOptn = this.createElementBtr('option', {
                        value: option.value, 
                        class: 'select-opt', 
                        text: option.textContent
                    });
                    // remove all previously selected elements from the select
                    this.selectEl.querySelectorAll('option.select-opt').forEach(optn => optn.remove()); 
                    // add to select input 
                    this.selectEl.add(selectedOptn); 
                    // set the value of the select to the option just clicked
                    this.selectEl.value = option.value;
                    // clear the current search box and search results
                    this.inputEl.value = null;
                    this.clearSearchResults(); 
                    // hide the select box 
                    this.searchMenu.hidden = true;
                    // show the original select element with the selected option 
                    this.selectEl.style.visibility = "visible";  
                    // trigger a 'change' event on the select input when an option is chosen
                    this.selectEl.dispatchEvent(new CustomEvent('skpselect:change', { detail: { item } }));
                });
                //append to search possible selections
                this.selectBox.appendChild(option); 
            }
        }
    }
    displayLoadingMsg() {
        this.clearSearchResults();
        let option = this.createElementBtr('button', {
            type: 'button',
            value: null, 
            class: 'list-group-item list-group-item-action select-opt-btn disabled', 
            text: 'Loading...'
        });
        this.selectBox.appendChild(option); 
    }
    displayNoResultsMsg() {
        this.clearSearchResults();
        let option = this.createElementBtr('button', {
            type: 'button',
            value: null, 
            class: 'list-group-item list-group-item-action select-opt-btn disabled', 
            text: 'No items match your search'
        });
        this.selectBox.appendChild(option); z
    }
    createElementBtr(tag, attributes) { 
        const el = document.createElement(tag); 
        Object.keys(attributes).forEach((key) => {
            if (key == "text") { 
                el.textContent = attributes[key]; 
            } else {
                el.setAttribute(key, attributes[key]);
            }
        }) 
        return el; 
    }
}