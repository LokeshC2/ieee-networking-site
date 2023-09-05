<script lang="ts">
  export let id = "";
  export let name = "";
  export let value: Date = new Date();
  export let mode: "hour24" | "hour12" = "hour24";
  type Field =
    | "year"
    | "month"
    | "date"
    | "hour"
    | "minute"
    | "second"
    | "millisecond"
    | "timeZone";

  export let fields: Field[] = [
    "year",
    "month",
    "date",
    "hour",
    "minute",
    "timeZone",
  ];

  let year = value.getFullYear();
  let month = value.getMonth();
  let date = value.getDate();
  let hour24 = value.getHours();
  let hour12 = value.getHours() % 12;
  let AMPM = value.getHours() < 12 ? "AM" : "PM";
  let minute = value.getMinutes();
  let second = value.getSeconds();
  let millisecond = value.getMilliseconds();

  $: hour24 = hour12 + (AMPM === "AM" ? 0 : 12);

  $: value =
    mode === "hour24"
      ? new Date(year, month, date, hour24, minute, second, millisecond)
      : new Date(
          year,
          month,
          date,
          hour12 + (AMPM === "AM" ? 0 : 12),
          minute,
          second,
          millisecond
        );

  let dialogElement: HTMLDialogElement;
</script>

<input
  {id}
  {name}
  type="datetime-local"
  readonly
  value={value.toISOString().slice(0, -1)}
  on:focus={()=>dialogElement.showModal()}
/>

<dialog bind:this={dialogElement}>
  <button on:click={() => dialogElement.close}>Close</button>
  <table>
    {#if fields.includes("year")}
      <tr>
        <td>
          <button on:click={() => year++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={year} />
        </td>
        <td>
          <button on:click={() => year--}>-</button>
        </td>
      </tr>
    {/if}

    {#if fields.includes("month")}
      <tr>
        <td>
          <button on:click={() => month++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={month} />
        </td>
        <td>
          <button on:click={() => month--}>-</button>
        </td>
      </tr>
    {/if}

    {#if fields.includes("date")}
      <tr>
        <td>
          <button on:click={() => date++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={date} />
        </td>
        <td>
          <button on:click={() => date--}>-</button>
        </td>
      </tr>
    {/if}

    {#if fields.includes("hour")}
      {#if mode === "hour24"}
        <tr>
          <td>
            <button on:click={() => hour24++}>+</button>
          </td>
          <td>
            <input type="number" bind:value={hour24} />
          </td>
          <td>
            <button on:click={() => hour24--}>-</button>
          </td>
        </tr>
      {:else}
        <tr>
          <td>
            <button on:click={() => hour12++}>+</button>
          </td>
          <td>
            <input type="number" bind:value={hour12} />
          </td>
          <td>
            <button on:click={() => hour12--}>-</button>
          </td>
        </tr>
      {/if}
    {/if}

    {#if fields.includes("minute")}
      <tr>
        <td>
          <button on:click={() => minute++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={minute} />
        </td>
        <td>
          <button on:click={() => minute--}>-</button>
        </td>
      </tr>
    {/if}

    {#if fields.includes("second")}
      <tr>
        <td>
          <button on:click={() => second++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={second} />
        </td>
        <td>
          <button on:click={() => second--}>-</button>
        </td>
      </tr>
    {/if}

    {#if fields.includes("millisecond")}
      <tr>
        <td>
          <button on:click={() => millisecond++}>+</button>
        </td>
        <td>
          <input type="number" bind:value={millisecond} />
        </td>
        <td>
          <button on:click={() => millisecond--}>-</button>
        </td>
      </tr>
    {/if}

    {#if mode === "hour12"}
      <tr>
        <td>
          <button on:click={() => (AMPM = "AM")}>AM</button>
        </td>
        <td>
          <button on:click={() => (AMPM = "PM")}>PM</button>
        </td>
      </tr>
    {/if}
  </table>
</dialog>
