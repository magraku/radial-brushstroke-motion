<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- monami is a single-page app: all mock data lives in src/data/mock.ts and all UI copy (French) in src/lib/copy.ts, so both can be swapped for an API / translations later.
- All UI components live in src/components/monami/; the brand wordmark (MonamiLogo) and mascot (Mascot) are inline SVGs converted from the user's VectorCraft file — keep them as source, not CDN assets.
- The winding tree uses merged branch geometry and instanced branch-attached foliage with CSS palette tokens; this preserves its silhouette and keeps rendering economical.
- Users sign in with email+password (email confirmation on); profile, inventory and saved offers live as one validated JSON blob in the user's own `profiles` row (RLS: owner only), restored through src/lib/demo-profile.ts so the shape stays in one schema.
- Saved buying offers are separate from selling inventory so profile totals never count a watched purchase as an item for sale.
