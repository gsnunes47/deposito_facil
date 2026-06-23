import { useState } from 'react';

export default function Login() {
  const [login, setUsername] = useState('');
  const [password, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data = {
      login,
      password,
    };

    try {
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_APIURL}/login/${process.env.NEXT_PUBLIC_TENANT}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const result = await response.json();

      console.log('Success:', result);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <form method="POST" className="form-login" onSubmit={handleSubmit}>
        <label>Usuário</label>
        <input
          type="text"
          value={login}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <br />

        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setSenha(e.target.value)}
        />

        <br />
        <br />

        <button type="submit" className="form-login-btn">
          Entrar
        </button>
      </form>
    </div>
  );
}
