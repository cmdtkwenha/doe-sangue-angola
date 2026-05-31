import { reportError, trackApiRequest } from "@doe-sangue-angola/shared-services";

type Handler<T> = () => Promise<T> | T;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiResponse<T>(handler: Handler<T>) {
  const started = Date.now();
  try {
    const data = await handler();
    trackApiRequest("api.route", 200, Date.now() - started);
    return Response.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ApiError) {
      trackApiRequest("api.route", error.status, Date.now() - started);
      return Response.json({ ok: false, message: error.message }, { status: error.status });
    }
    reportError(error, { feature: "api.route" });
    trackApiRequest("api.route", 500, Date.now() - started);
    const message = error instanceof Error
      ? friendlyDatabaseMessage(error.message)
      : "A sincronização não foi concluída. Tente novamente.";
    return Response.json(
      {
        ok: false,
        message
      },
      { status: 500 }
    );
  }
}

function friendlyDatabaseMessage(message: string) {
  if (/schema cache|Could not find (the )?(table|column)|does not exist/i.test(message)) {
    return "Configuração da base de dados incompleta. Execute as migrations e volte a tentar.";
  }
  return message;
}

export async function readJson<T extends object>(request: Request) {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    return {} as Partial<T>;
  }
}
