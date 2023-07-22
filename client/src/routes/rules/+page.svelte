<script lang="ts">
  import BackButton from '$lib/backButton.svelte';
</script>

<svelte:head>
  <title>Ultimate tictactoe</title>
</svelte:head>

<BackButton href="/" />

<main class="flex items-center h-screen justify-center flex-col">
  <div class="container">
    <h1 class="text-4xl font-bold text-center">Rules</h1>

    <div class="content">
      <ul>
        <li>You will have a main board with 9 sub boards within it.</li>
        <li>You always play in one of the sub boards at a time.</li>
        <li>The opponent's move is determined by where you place your piece in the sub board.</li>
        <li>
          When you win in a sub board, a piece is drawn over it (e.g., "x" if you're playing as
          "x").
        </li>
        <li>The ultimate goal is to win in a tic-tac-toe style on the main board.</li>
        <li>
          If you can't play in the designated sub board (because the board is finished, either with
          a piece drawn over it or a tie), you'll stay in the same board. If you can't play there
          either for the same reason, you'll go back to the previous board.
        </li>
        <li>
          Mouse hover is used for previews, showing the move list or the opponent's next move.
        </li>
        <li>
          Hovering over the board will show the correct board, and you can also view the history of
          moves on the right.
        </li>
      </ul>
    </div>
  </div>
</main>

<style>
  .container {
    @apply w-full;
    max-width: 1280px;
  }

  .content {
    font-size: 24px;
  }

  .content ul {
    list-style: decimal;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>