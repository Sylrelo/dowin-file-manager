<script lang="ts">
  import { fsJobQueue } from "../services/FsQueue";
  import { uploadJobQueue } from "../services/UploadQueue";
  import TablerIcon from "./Icons/TablerIcon.svelte";
  import { v4 as uuidv4 } from "uuid";

  import { slide } from "svelte/transition";
  import { Http } from "../http";
  import { sizeFormatter } from "../utils";

  interface Job {
    title: string;
    subtitle: string;
    progress: number;
    speed: number;

    type: string;

    id: string;
    job_id: string;
  }

  let runningJobs: Job[] = [];
  let pendingJobsCount: number = 0;

  const test = [
    {
      progress: 10,
      speed: 0,
      subtitle: "Pellentesque fermentum lorem vitae auctor dictum.",
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      type: "MV",
      id: uuidv4(),
    },
    {
      progress: 40,
      speed: 0,
      subtitle: "Pellentesque fermentum lorem vitae auctor dictum.",
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      type: "CP",
      id: uuidv4(),
    },
    {
      progress: 80,
      speed: 0,
      subtitle: "Pellentesque fermentum lorem vitae auctor dictum.",
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      type: "UP",
      id: uuidv4(),
    },
  ];

  $: if ($uploadJobQueue || $fsJobQueue) {
    pendingJobsCount =
      fsJobQueue.pending.length + uploadJobQueue.pending.length;

    runningJobs = [
      ...uploadJobQueue.asJobProgress,
      ...fsJobQueue.asJobProgress,
      // ...test,
    ];
  }

  const ICON: { [key: string]: string } = {
    CP: "copy",
    MV: "file-export",
    UP: "upload",
  };
</script>

<div class="container">
  {#each runningJobs as job (job.id)}
    <div class="fsjob" transition:slide={{ delay: 0, duration: 200 }}>
      <div class="title">
        <div class="icon">
          <TablerIcon icon={ICON[job.type]} />
        </div>
        <span> {job.title}</span>
      </div>
      <div class="subtitle">
        <span>{job.subtitle}</span>
      </div>
      <div class="progress">
        <span style:width="{job.progress}%" />
      </div>
      <div class="progress-percent">{job.progress}%</div>
      <div class="progress-speed">{sizeFormatter(job.speed)} /s</div>

      <div class="cancel">
        <button
          type="button"
          on:click={async () => {
            if (job.type === "CP" || job.type === "MV") {
              await Http.post("fs/cancel/" + job.job_id, {});
            }
          }}
        >
          <TablerIcon icon="ban" />
          cancel</button
        >
      </div>
    </div>
  {/each}

  {#if pendingJobsCount}
    <div>{pendingJobsCount} pending</div>
  {/if}
</div>

<style lang="scss">
  @keyframes colorrush {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: calc(10 * (12px / 0.707)) 100%;
    }
  }

  .container {
    position: absolute;
    bottom: 0px;
    right: 0px;

    display: flex;
    flex-direction: column;
    gap: 10px;

    // width: calc(400px - 12px * 2);
    // height: calc(200px - 12px * 2);

    padding: 12px;

    border-radius: 5px;

    z-index: 100;

    // border: 2px solid var(--main-color-10);
    // background-color: var(--main-color-3);
    // background-color: #00000033;
    // backdrop-filter: blur(5px);
  }

  .fsjob {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 2px;
    // margin-bottom: 8px;

    border-radius: inherit;

    background-color: var(--main-color-4);
    // background-color: var(--main-color-alpha-8);
    // backdrop-filter: blur(var(--primary-blur-strength));

    padding: 8px;

    box-shadow: #00000055 2px 2px 10px 5px;

    width: 320px;

    .cancel {
      margin-top: 8px;
      > button {
        display: flex;
        align-items: center;
        gap: 4px;

        padding: 2px 4px;
        border-radius: 5px;
        color: rgb(243, 120, 120);
        border: 1px solid rgba(243, 120, 120, 0.419);

        transition: all 0.2s ease-in-out;

        &:hover {
          color: black;
          background-color: rgb(243, 120, 120);
          cursor: pointer;
        }
      }
    }

    .progress-percent {
      position: absolute;

      top: 4px;
      right: 10px;
      font-size: 1.3rem;
    }

    .progress-speed {
      position: absolute;

      bottom: 48px;
      right: 10px;
      font-size: 0.8rem;
    }

    .title,
    .subtitle {
      text-align: left;

      display: flex;
      align-items: center;
      gap: 4px;

      font-size: 0.85rem;
      > span {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    .title {
      font-weight: bold;
      > span {
        width: 245px;
      }
    }

    .subtitle {
      font-size: 0.85rem;
      > span {
        width: 266px;
      }
    }

    .progress {
      // background-color: var(--main-color-12);
      border: 1px solid #ffffff44;
      overflow: hidden;

      width: 100%;
      height: 6px;

      border-radius: inherit;

      > span {
        display: block;
        height: inherit;

        transition: width 0.5s ease-out;

        animation: colorrush 10s infinite linear;
        background: repeating-linear-gradient(
            45deg,
            transparent 0 6px,
            rgba(0, 0, 0, 0.2) 6px 12px
          ),
          linear-gradient(#ffffff44, #ffffff44, #ffffff44);
        background-size:
          calc(12px / 0.707) 100%,
          100% 800%;
      }
    }
  }
</style>
