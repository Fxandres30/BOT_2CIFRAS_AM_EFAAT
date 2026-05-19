const cacheAdmins =
  new Map();

/* 🔥 OBTENER ADMINS */
export async function obtenerAdminsGrupo(

  sock,
  grupoId

) {

  const cache =
    cacheAdmins.get(
      grupoId
    );

  // 🔥 usar cache
  if (

    cache &&

    Date.now() <
    cache.expira

  ) {

    return cache.admins;
  }

  // 🔥 pedir metadata
  const metadata =
    await sock.groupMetadata(
      grupoId
    );

  // 🔥 extraer admins
  const admins =
    metadata.participants

      .filter(

        p =>

          p.admin === "admin"
          ||

          p.admin ===
          "superadmin"

      )

      .map(p => p.id);

  // 🔥 guardar cache
  cacheAdmins.set(

    grupoId,

    {

      admins,

      expira:

        Date.now()

        +

        1000 * 60 * 15

    }
  );

  return admins;
}