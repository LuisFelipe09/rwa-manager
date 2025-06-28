import { CodeLanguage, Location, buildRequestCBOR } from "@chainlink/functions-toolkit";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { source, args } = req.body as {
      source: string;
      args: string[];
    };

    if (!source || !Array.isArray(args)) {
      return res.status(400).json({ error: "Missing source or args" });
    }

    const cbor = buildRequestCBOR({
      codeLocation: Location.Inline,
      codeLanguage: CodeLanguage.JavaScript,
      source,
      args,
    });

    return res.status(200).json({ cbor });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
