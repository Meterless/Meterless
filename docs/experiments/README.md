# Experiments

Experiments are apps that would be too expensive to run on metered APIs. They are built on the same Meterless Runtime that runs [Nightshift](../products/nightshift/README.md). Each one keeps models working far longer than per-call pricing would allow: characters who answer every line you say, a showrunner that keeps writing and filming, an analyst that rereads every account before you open it. On your own runtime that work costs only electricity. They are early, experimental, and free.

<table>
  <tr>
    <td width="33%" valign="top">
      <a href="meterless-city/README.md"><img src="meterless-city/media/card-meterless-city.webp" alt="Meterless City: a player holds C to talk to a passerby on a photoreal city street" width="100%" /></a>
      <b>Meterless City</b><br/>
      <sub>Game · Windows · unlocks characters that never go quiet</sub><br/><br/>
      Talk to anyone in a photoreal city. About 700 NPC turns an active hour, $0 per conversation.<br/><br/>
      <a href="meterless-city/README.md"><b>Explore →</b></a>
    </td>
    <td width="33%" valign="top">
      <a href="sitcomify/README.md"><img src="sitcomify/media/card-sitcomify.webp" alt="Sitcomify: a pink-haired busker with a guitar on a 90s street corner, a frame from a pilot made from one photo" width="100%" /></a>
      <b>Sitcomify</b><br/>
      <sub>Web app · Windows · CLI · MCP · unlocks a show that keeps filming</sub><br/><br/>
      One photo in, a 90s sitcom pilot out. Dream Mode keeps writing and filming until you stop it.<br/><br/>
      <a href="sitcomify/README.md"><b>Explore →</b></a>
    </td>
    <td width="33%" valign="top">
      <a href="dataplant/README.md"><img src="dataplant/media/card-dataplant.webp" alt="DataPlant: an account 360 view with a health score and a synopsis written by a local model" width="100%" /></a>
      <b>DataPlant</b><br/>
      <sub>Desktop app · Windows · unlocks analysis before you ask</sub><br/><br/>
      A customer-success platform that re-scores every account in the background. 0 cloud calls.<br/><br/>
      <a href="dataplant/README.md"><b>Explore →</b></a>
    </td>
  </tr>
</table>

## The numbers

| Experiment | Headline | Source |
|---|---|---|
| Meterless City | ~700 NPC turns per active hour. 66% answered instantly from pre-written pools. One hour of talk is about 445 model calls and 22,500 characters of speech: $0.02 to $0.06 on your runtime vs $0.46 to $6.60 on metered APIs. | Logs of 2,347 NPC turns, Oct 2, 2026, at mid-2026 list prices |
| Sitcomify | 4 scenes and 14 consistent cast members and props from one photo. 33 MCP tools for coding agents. | The Sweet Street Beats pilot |
| DataPlant | 3,303 actions logged in 24 hours. Churn model AUC 0.903 (5-fold CV). 0 bytes sent out. | A demo workspace of 40 fictional accounts |

Experiments are unfinished on purpose. Sitcomify can also use a cloud provider you connect, which receives what you send it and may charge for it.

## Build your own

Every experiment reaches the runtime over one OpenAI-compatible URL. To point your own app at it, follow [docs/agent-ready/add-meterless-provider.md](../agent-ready/add-meterless-provider.md). To build on the engines underneath, start at [engines/](../../engines/).
