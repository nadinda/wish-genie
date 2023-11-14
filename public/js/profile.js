const showModal = (id) => {
  const modal = document.getElementById(id);

  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

const copyText = (id) => {
  const input = document.querySelector(id);
  input.select();
  document.execCommand("copy");
}