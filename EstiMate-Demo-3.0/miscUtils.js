export function showAlert(message, duration = 1000) {
    const alertBox = document.getElementById("customAlert");
    alertBox.textContent = message;
    alertBox.style.display = "block";
  
    setTimeout(() => {
      alertBox.style.display = "none";
    }, duration);
  }