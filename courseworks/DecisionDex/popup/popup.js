const resultNode = document.getElementById("result");
const pingBtn = document.getElementById("pingBtn");

pingBtn?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "PING" }, (response) => {
    if (chrome.runtime.lastError) {
      resultNode.textContent = `Error: ${chrome.runtime.lastError.message}`;
      return;
    }

    if (response?.ok) {
      resultNode.textContent = "Background responded: OK";
      return;
    }

    resultNode.textContent = "No response from background";
  });
});
