alter table public.support_issues
add column if not exists severity text not null default 'Média'
check (severity in ('Baixa', 'Média', 'Alta', 'Crítica'));

create index if not exists support_issues_severity_idx
on public.support_issues(severity);
