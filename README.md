# SelectMany.js
A Bootstrap 5 native searchable select input.

![Untitled video (1)](https://github.com/Sukup-Manufacturing-Company/SukupSelect/assets/129898106/9678cca0-bb89-4271-9785-5472342f5a4b)

## Installation

#### HTML: 

```HTML
<link rel="stylesheet" href="SelectMany.css"/>
<script type="text/javascript" src="SelectMany.js"></script>
```
#### NPM 
coming soon...

#### Nuget 
coming soon...

## Usage

#### Local Data Source 

```js
  const selectElement = document.getElementById("myselect"); 
  const selectOptions =  [
          {
              text: 'apples', 
              value: 1
          },
          {
              text: 'bananas', 
              value: 2
          },
          {
              text: 'oranges', 
              value: 3
          },
          {
              text: 'papayas', 
              value: 45
          }
      ]; 

  const config = {
      element: selectElement, 
      localData: selectOptions, 
  }
  const SelectMany = new SelectMany(config); 
```

#### Remote Data Source
```js
  const selectElement = document.getElementById("myselect"); 
  const config = {
      element: selectElement,  
      remoteData: {
          url: "http://localhost:58527/api/values", 
          method: "get",
      }
  }
  const SelectMany = new SelectMany(config);
```
The properties of `remoteData` are used to call the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) for making ajax requests.
With the exception of the `url` property (which is mapped to the `resource` parameter) the remaining properties are mapped to the `options` parameter when `fetch(resource, options)` is called. 
I.e., you have full control of the `Request` object through the `remoteData` property. See a comprehensive list of options [here](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options)

A request is made to the provided url by appending a parameter (named `searchVal`) to the query string. 
E.g., if `url` is set to `https://www.approot.com/api/fruits` and the user types in `"banana"`, a request is made to `https://www.approot.com/api/fruits?searchVal=banana`.     
