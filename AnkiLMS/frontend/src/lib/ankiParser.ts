import JSZip from "jszip";
import initSqlJs, { Database } from "sql.js";

export interface AnkiCard {
  id: number;
  noteId: number;
  deckName: string;
  front: string;
  back: string;
  fields: string[];
  tags: string[];
  koreanText?: string;
  vietnameseMeaning?: string;
  romanization?: string;
  exampleSentence?: string;
  mediaFiles: string[];
  dueDate: number;
  interval: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review";
}

export interface AnkiDeck {
  id: string;
  name: string;
  cardCount: number;
  cards: AnkiCard[];
}

export class AnkiParser {
  private static sqlInstance: any = null;

  private static async getSqlEngine() {
    if (!this.sqlInstance) {
      this.sqlInstance = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });
    }
    return this.sqlInstance;
  }

  /**
   * Parse an uploaded Anki .apkg File object
   */
  public static async parseApkg(file: File): Promise<AnkiDeck[]> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Locate SQLite DB inside zip (collection.anki2 or collection.anki21)
    let dbFile = zip.file("collection.anki2") || zip.file("collection.anki21");
    if (!dbFile) {
      // Find any file ending with .anki2
      const matchedName = Object.keys(zip.files).find((filename) =>
        filename.endsWith(".anki2") || filename.endsWith(".anki21")
      );
      if (matchedName) {
        dbFile = zip.file(matchedName);
      }
    }

    if (!dbFile) {
      throw new Error("Không tìm thấy dữ liệu bộ thẻ (collection.anki2) trong file .apkg!");
    }

    const dbBuffer = await dbFile.async("uint8array");

    // 2. Initialize sql.js and load SQLite DB
    const SQL = await this.getSqlEngine();
    const db: Database = new SQL.Database(dbBuffer);

    // 3. Read media mapping if available
    const mediaFile = zip.file("media");
    let mediaMap: Record<string, string> = {};
    if (mediaFile) {
      try {
        const mediaJson = await mediaFile.async("text");
        mediaMap = JSON.parse(mediaJson);
      } catch (e) {
        console.warn("Lỗi đọc file media map từ apkg:", e);
      }
    }

    // 4. Query Decks & Cards from SQLite database
    const colResult = db.exec("SELECT decks, models FROM col");
    let decksJson: Record<string, any> = {};
    let modelsJson: Record<string, any> = {};

    if (colResult.length > 0 && colResult[0].values.length > 0) {
      const [decksStr, modelsStr] = colResult[0].values[0];
      try {
        decksJson = JSON.parse(decksStr as string);
        modelsJson = JSON.parse(modelsStr as string);
      } catch (e) {
        console.warn("Lỗi parse JSON decks/models:", e);
      }
    }

    // Query Notes
    const notesResult = db.exec("SELECT id, mid, flds, tags FROM notes");
    const notesMap: Map<number, { mid: number; flds: string[]; tags: string[] }> = new Map();

    if (notesResult.length > 0) {
      for (const row of notesResult[0].values) {
        const id = row[0] as number;
        const mid = row[1] as number;
        const rawFlds = (row[2] as string) || "";
        const rawTags = (row[3] as string) || "";

        const flds = rawFlds.split("\x1f");
        const tags = rawTags.trim().split(" ").filter(Boolean);

        notesMap.set(id, { mid, flds, tags });
      }
    }

    // Query Cards
    const cardsResult = db.exec("SELECT id, nid, did, type, queue, due, ivl, reps, lapses FROM cards");
    const deckMap: Map<string, AnkiCard[]> = new Map();

    if (cardsResult.length > 0) {
      for (const row of cardsResult[0].values) {
        const cardId = row[0] as number;
        const noteId = row[1] as number;
        const deckId = String(row[2]);
        const type = row[3] as number;
        const queue = row[4] as number;
        const due = row[5] as number;
        const ivl = row[6] as number;
        const reps = row[7] as number;
        const lapses = row[8] as number;

        const note = notesMap.get(noteId);
        if (!note) continue;

        const deckMeta = decksJson[deckId] || { name: "Default" };
        const deckName = deckMeta.name || "Default";

        const fields = note.flds;
        const front = cleanHtml(fields[0] || "");
        const back = cleanHtml(fields[1] || fields[0] || "");

        // Smart extraction of Korean fields if available
        const koreanText = extractKoreanText(fields);
        const vietnameseMeaning = extractVietnameseText(fields);
        const exampleSentence = extractExampleSentence(fields);

        // Determine state
        let state: "new" | "learning" | "review" = "new";
        if (queue === 1 || queue === 3) state = "learning";
        else if (queue === 2) state = "review";

        const card: AnkiCard = {
          id: cardId,
          noteId,
          deckName,
          front,
          back,
          fields,
          tags: note.tags,
          koreanText: koreanText || front,
          vietnameseMeaning: vietnameseMeaning || back,
          exampleSentence,
          mediaFiles: [],
          dueDate: due,
          interval: ivl,
          reps,
          lapses,
          state,
        };

        if (!deckMap.has(deckName)) {
          deckMap.set(deckName, []);
        }
        deckMap.get(deckName)!.push(card);
      }
    }

    db.close();

    // 5. Convert to AnkiDeck array
    const resultDecks: AnkiDeck[] = [];
    deckMap.forEach((cards, name) => {
      resultDecks.push({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        cardCount: cards.length,
        cards,
      });
    });

    return resultDecks;
  }
}

// Utility to clean raw HTML tags from Anki fields
function cleanHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract Hangul text from fields using Unicode range \uAC00-\uD7A3
function extractKoreanText(fields: string[]): string | undefined {
  const koreanRegex = /[\uAC00-\uD7A3]+/;
  for (const field of fields) {
    const cleaned = cleanHtml(field);
    if (koreanRegex.test(cleaned)) {
      return cleaned;
    }
  }
  return undefined;
}

function extractVietnameseText(fields: string[]): string | undefined {
  for (let i = 1; i < fields.length; i++) {
    const cleaned = cleanHtml(fields[i]);
    if (cleaned && !/[\uAC00-\uD7A3]+/.test(cleaned)) {
      return cleaned;
    }
  }
  return undefined;
}

function extractExampleSentence(fields: string[]): string | undefined {
  for (const field of fields) {
    const cleaned = cleanHtml(field);
    if (cleaned.length > 20 && /[\uAC00-\uD7A3]+/.test(cleaned)) {
      return cleaned;
    }
  }
  return undefined;
}
