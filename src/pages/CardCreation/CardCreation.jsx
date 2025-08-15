import CardForm from "../CardForm/CardForm.jsx";

export default function CardCreation() {
  const handleCreate = async (formData) => {
    // 여기에 cardcreation api 들어와야됨.
    // EX) await fetch("/api/cards", { method: "POST", body: formData });
    console.log("create payload", Object.fromEntries(formData.entries()));
    alert("저장되었습니다. (데모)");
  };

  return <CardForm mode="create" onSubmit={handleCreate} />;
}
