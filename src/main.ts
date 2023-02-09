import "./style.css";

const App = document.querySelector("#app");

if (App) {
  console.log("- ", App);
  App.innerHTML = `
  <div>
  test
  </div>
`;
}
