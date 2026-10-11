# DROPZONE — etap 2: lokalne uruchomienie + bezpieczniejsze operacje

Aplikacja Next.js + TypeScript + Supabase. Ten etap dodaje atomowe operacje SQL dla otwierania skrzyń i tworzenia/dołączania do Case Battle. System korzysta wyłącznie z **wirtualnych punktów**.

## Wymagania
- Windows 10/11
- Node.js 20 lub nowszy (zalecany LTS)
- Konto Supabase (darmowy projekt wystarczy do lokalnych testów)
- Terminal PowerShell

## Krok 1 — rozpakuj projekt
Rozpakuj `dropzone-stage2-local.zip` do folderu bez polskich znaków, np. `C:\Projects\dropzone`.

## Krok 2 — skonfiguruj Supabase
1. Utwórz projekt w Supabase.
2. Wejdź w **SQL Editor**.
3. Uruchom najpierw cały plik `supabase/schema.sql`.
4. Następnie uruchom cały plik `supabase/stage2_atomic_functions.sql`.
5. Wejdź w **Project Settings → API** (w niektórych wersjach panelu: API Keys) i skopiuj:
   - Project URL
   - klucz `anon` / publishable key
   - klucz `service_role` / secret key
6. W Authentication → Providers upewnij się, że Email jest włączony.
7. Na czas lokalnych testów możesz wyłączyć „Confirm email”, żeby nie musieć weryfikować konta za każdym razem. Przed publicznym uruchomieniem skonfiguruj weryfikację e-maila i reset hasła.

**Ważne:** nigdy nie umieszczaj `service_role` w kodzie przeglądarki, nie wysyłaj go nikomu i nie commituj `.env.local`.

## Krok 3 — ustaw zmienne środowiskowe
W PowerShellu, będąc w katalogu projektu:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Uzupełnij trzy wartości prawdziwymi danymi z Supabase. Usuń placeholdery `YOUR_PROJECT` i `your-...`. Zapisz plik.

## Krok 4 — zainstaluj zależności
Zainstaluj Node.js, jeśli jeszcze go nie masz, a następnie otwórz PowerShell w folderze projektu:

```powershell
node -v
npm -v
npm install
```

Jeżeli `node -v` pokazuje wersję niższą niż 20, zaktualizuj Node.js.

## Krok 5 — uruchom aplikację
```powershell
npm run dev
```
Otwórz `http://localhost:3000`. Zatrzymanie serwera: `Ctrl+C`.

## Krok 6 — sprawdź logowanie
1. Kliknij „Zaloguj się”.
2. Wpisz e-mail i hasło (co najmniej 8 znaków).
3. Wybierz rejestrację.
4. Jeśli weryfikacja e-maila jest włączona, kliknij link z wiadomości.
5. Zaloguj się i odśwież stronę. Profil oraz saldo startowe powinny powstać przez trigger bazy.

## Krok 7 — testy funkcji
- Spróbuj otworzyć skrzynię bez logowania — API powinno zwrócić 401.
- Otwórz 1 i 5 skrzyń, a potem sprawdź, czy saldo i ekwipunek zapisują się.
- Spróbuj otworzyć 0 lub 6 skrzyń — API powinno odrzucić żądanie.
- Spróbuj otworzyć skrzynię bez punktów — saldo nie powinno spaść poniżej zera.
- Sprawdź tworzenie bitwy i dołączanie drugiego konta.
- Zajrzyj w Supabase Table Editor do `profiles`, `case_openings`, `case_opening_items`, `inventory`, `battles` i `battle_participants`.

**Uwaga o dropach:** bazowy `schema.sql` tworzy katalog skrzyń, ale nie zasila tabeli `drops`. Jeśli skrzynie nie mają dropów, trzeba dodać przykładowe pozycje w `public.drops` przed testem otwierania. W tej wersji szansa na drop jest liczona z kolumny `weight`; to wartości konfiguracyjne, a nie gwarancja konkretnego wyniku.

## Krok 8 — kompilacja kontrolna
Zatrzymaj serwer i uruchom:

```powershell
npm run build
```

Jeśli build zakończy się błędem, skopiuj cały komunikat i prześlij go do dalszej diagnozy.

## Co daje etap 2?
- Otwarcie od 1 do 5 skrzyń w jednej transakcji PostgreSQL.
- Odjęcie punktów, zapis historii i dodanie przedmiotów odbywają się atomowo.
- Tworzenie bitwy i dołączenie gracza wykonują blokady w bazie, ograniczając wyścigi przy równoczesnych żądaniach.
- API nadal wymaga zalogowanego użytkownika i nie ufa identyfikatorowi użytkownika przesłanemu przez przeglądarkę.

## Nadal przed publicznym uruchomieniem
To nadal środowisko developerskie, nie audytowana platforma produkcyjna. Przed publikacją dodaj rate limiting i ochronę antybotową, reset hasła, testy integracyjne i bezpieczeństwa, monitoring, kopie zapasowe, zasady prywatności/regulamin i pełny przepływ realtime dla lobby. Weryfikuj działanie połączeń równoczesnych na stagingu. Nie dodawaj wpłat, wypłat ani zakładów za prawdziwe pieniądze bez odpowiedniej analizy prawnej i licencji.
