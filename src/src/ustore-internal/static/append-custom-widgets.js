
(function () {
    "use strict";

    var galleryListView = function galleryListView(props) {
        return /*#__PURE__*/React.createElement("div", null, props.schema.enum.map(function (item) {
            return /*#__PURE__*/React.createElement("span", {
                style: {
                    display: 'inline-block',
                    width: '70px',
                    height: '70px',
                    textAlign: 'center',
                    backgroundColor: item,
                    marginRight: '10px',
                    borderRadius: '10px',
                    color: 'white',
                    paddingTop: '20px'
                },
                onClick: function onClick() {
                    return props.onChange(item);
                }
            }, item);
        }));
    };

    var clickMe = function clickMe(props) {
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, "My Custom Widget"), /*#__PURE__*/React.createElement("div", {
            onClick: function onClick() {
                return props.onChange('clicked');
            }
        }, "Click Me !"));
    };

    window.customWidgets = {}
    window.customWidgets['galleryListView'] = galleryListView
    window.customWidgets['clickMe'] = clickMe

}())



// (async function () {


//     var style = ''
//     var html = ''
//     var js = ''

//     setTimeout(() => {
//         style = `.container {
//             padding: 8px;
//           }

//           button {
//             display: block;
//             overflow: hidden;
//             position: relative;
//             padding: 0 16px;
//             font-size: 16px;
//             font-weight: bold;
//             text-overflow: ellipsis;
//             white-space: nowrap;
//             cursor: pointer;
//             outline: none;

//             width: 100%;
//             height: 40px;

//             box-sizing: border-box;
//             border: 1px solid #a1a1a1;
//             background: #ffffff;
//             box-shadow: 0 2px 4px 0 rgba(0,0,0, 0.05), 0 2px 8px 0 rgba(161,161,161, 0.4);
//             color: #363636;
//             cursor: pointer;
//           }`

//         html = `<div class="container">
//                     <button>Label</button>
//                 </div>`

//         js = ``
//     }, 2000);


//     class Button extends HTMLElement {
//         constructor() {
//             super();

//             const template = document.createElement('template');

//             template.innerHTML = `
//             <style>${style}</style>
//             ${html}
//             <script>${js}</script>
//             `

//             this._shadowRoot = this.attachShadow({ mode: 'open' });
//             this._shadowRoot.appendChild(template.content.cloneNode(true));

//             this.$button = this._shadowRoot.querySelector('button');
//         }

//         static get observedAttributes() {
//             return ['label'];
//         }

//         attributeChangedCallback(name, oldVal, newVal) {
//             if (oldVal === newVal) return
//             this[name] = newVal;

//             this.render();
//         }

//         render() {
//             this.$button.innerHTML = this.label;
//         }
//     }

//     customElements.define('my-button', Button);





//     // window.customWidgets = window.customWidgets || []

//     // const loadWidgets = async () => {
//     //     setTimeout(() => {
//     //         window.customWidgets.push({
//     //             name: 'customX',
//     //             component: new Function('props', `
//     //             const e = React.createElement;
//     //             const { options, value } = props;
//     //             const { color, backgroundColor } = options;
//     //             const onChange = (event) => {
//     //                 const val = event.target.value;
//     //                 ///
//     //                 props.onChange(val != "" ? val : null);
//     //             }
//     //             return e(
//     //                 'input',
//     //                 {
//     //                     style: { color, backgroundColor },
//     //                     class: "form-control",
//     //                     value: value,
//     //                     onChange: onChange
//     //                 }
//     //             );`)
//     //         })

//     //         // window.customWidgets.push({
//     //         //     name: 'galleryListView',
//     //         //     component: new Function(`
//     //         //     console.log(props)
//     //         //     const e = React.createElement;
//     //         //     return e('div', null
//     //         //         {props.schema.enum.map((item) => {
//     //         //             return <span style={{
//     //         //                 display: 'inline-block',
//     //         //                 width: '70px',
//     //         //                 height: '70px',
//     //         //                 textAlign: 'center',
//     //         //                 backgroundColor: item,
//     //         //                 marginRight: '10px',
//     //         //                 borderRadius: '10px',
//     //         //                 color: 'white',
//     //         //                 paddingTop: '20px'
//     //         //             }}
//     //         //                 onClick={() => props.onChange(item)}>{item}</span>
//     //         //         })
//     //         //         })
//     //         //     </div >`
//     //         //     )
//     //         // })
//     //     }, 3000);
//     // }

//     // await loadWidgets()

// })()