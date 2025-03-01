import pb from "../utils/pocketbase.js";

export default function Auth() {
  return (
    <>
      <h1>Logged In: {pb.authStore.isValid.toString()}</h1>
    </>
  );
}
