const sections = [
  {
    title: "Dados",
    items: [
      "Confirmar tabelas Supabase e RLS",
      "Trocar mockProvider por supabaseProvider",
      "Validar repositórios por função"
    ]
  },
  {
    title: "Segurança",
    items: [
      "Bloquear service role no cliente",
      "Validar sessão nas API routes",
      "Testar isolamento hospital/dador"
    ]
  },
  {
    title: "Operação",
    items: [
      "Ativar monitorização real",
      "Ensaiar rollback para mock",
      "Validar notificações seguras"
    ]
  }
];

export function ProductionMigrationChecklist() {
  return (
    <section className="panel">
      <div className="eyebrow">Migração para produção</div>
      <h2>Checklist mock → dados reais</h2>
      <div className="grid metrics">
        {sections.map((section) => (
          <article className="panel" key={section.title}>
            <strong>{section.title}</strong>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
