<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { chart } from 'svelte-apexcharts';
	import NoditLogo from '$lib/NoditLogo.svelte';

	import { type AllEventsInterfaceRaw } from '$lib/graphql_types';
	import { day_date_to_string } from '$lib/dates_utils';

	import { aptos_to_decimal } from '$lib/aptos_utils';

	let { data } = $props();
	let info = $derived(data.data.AllEvents);
	let db_data = $derived(data.db_data);

	$inspect(data);
	$inspect(db_data);

	//$inspect(info)
	//let data: AllEventsInterfaceRaw;

	// ---------- OVERVIEW DATA ----------
	let nb_requests_received = $derived.by(() => {
		return $info.data.newWorkRequest.length;
	});

	let nb_requests_successful = $derived.by(() => {
		return $info.data.bidWons.length;
	});

	let total_spend = $derived.by(() => {
		let counter: number = 0;

		$info.data.bidWons.forEach((e) => {
			counter += Number(e.data.bid_price);
		});

		return counter;
	});

	let nb_users = $derived.by(() => {
		let users_set = new Set([]);
		$info.data.newWorkRequest.forEach((entry) => {
			users_set.add(entry.data.requester);
		});

		return users_set.size;
	});

	let nb_providers = $derived.by(() => {
		let providers_set = new Set([]);
		$info.data.newBids.forEach((entry) => {
			providers_set.add(entry.data.bidder);
		});

		return providers_set.size;
	});

	let nb_requests_unsuccessful = $derived.by(() => {
		return $info.data.auctionFailures.length;
	});

	// ---------- DATA TRANSFORMATION ----------
	let historical_requests_data = $derived.by(() => {
		// get all requests and dates
		let requests_counter: {
			[key: string]: {
				failed: number;
				success: number;
			};
		} = {};
		let request_dates_mapping: { [key: number]: string } = {};
		$info.data.newWorkRequest.forEach((entry) => {
			// convert date of event to Date object
			let temp = new Date(Number(entry.data.time_limit) / 1000);
			temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
			let stringified = day_date_to_string(temp);
			request_dates_mapping[entry.data.request_id] = stringified;

			requests_counter[stringified] = {
				failed: 0,
				success: 0
			};
		});

		$info.data.bidWons.forEach((entry) => {
			let req_id = entry.data.request_id;
			requests_counter[request_dates_mapping[req_id]].success += 1;
		});

		$info.data.auctionFailures.forEach((entry) => {
			let req_id = entry.data.request_id;
			requests_counter[request_dates_mapping[req_id]].failed += 1;
		});

		let labels = Object.keys(requests_counter);
		let failed: number[] = [];
		let success: number[] = [];
		let nb: number[] = [];
		labels.forEach((l) => {
			failed.push(requests_counter[l].failed);
			success.push(requests_counter[l].success);
			nb.push(requests_counter[l].success + requests_counter[l].failed);
		});

		return {
			labels: Object.keys(requests_counter),
			count_both: nb,
			success: success,
			failed: failed
		};
	});

	let work_request_per_user = $derived.by(() => {
		let requests_counter: {
			[key: string]: {
				failed: number;
				success: number;
			};
		} = {};

		let request_creator_mapping: { [key: number]: string } = {};
		$info.data.newWorkRequest.forEach((entry) => {
			request_creator_mapping[entry.data.request_id] = entry.data.requester;

			requests_counter[entry.data.requester] = {
				failed: 0,
				success: 0
			};
		});

		$info.data.bidWons.forEach((entry) => {
			let req_id = entry.data.request_id;
			requests_counter[request_creator_mapping[req_id]].success += 1;
		});

		$info.data.auctionFailures.forEach((entry) => {
			let req_id = entry.data.request_id;
			requests_counter[request_creator_mapping[req_id]].failed += 1;
		});

		let labels = Object.keys(requests_counter);
		let failed: number[] = [];
		let success: number[] = [];
		let nb: number[] = [];
		labels.forEach((l) => {
			failed.push(requests_counter[l].failed);
			success.push(requests_counter[l].success);
			nb.push(requests_counter[l].success + requests_counter[l].failed);
		});

		let out = {
			labels: Object.keys(requests_counter),
			count_both: nb,
			success: success,
			failed: failed
		};

		return out;
	});

	let bids_per_worker_data = $derived.by(() => {
		let bids_counter: { [key: string]: number } = {};
		$info.data.newBids.forEach((entry) => {
			if (entry.data.bidder in bids_counter) {
				bids_counter[entry.data.bidder] += 1;
			} else {
				bids_counter[entry.data.bidder] = 1;
			}
		});

		return {
			labels: Object.keys(bids_counter),
			values: Object.values(bids_counter)
		};
	});

	let spend_per_address_data = $derived.by(() => {
		let spend_mapping: { [key: string]: number } = {};
		let request_creator_mapping: { [key: number]: string } = {};
		$info.data.newWorkRequest.forEach((entry) => {
			request_creator_mapping[entry.data.request_id] = entry.data.requester;
			spend_mapping[entry.data.requester] = 0;
		});

		$info.data.bidWons.forEach((entry) => {
			let req_id = entry.data.request_id;
			spend_mapping[request_creator_mapping[req_id]] += aptos_to_decimal(entry.data.bid_price);
		});

		return {
			labels: Object.keys(spend_mapping),
			values: Object.values(spend_mapping)
		};
	});

	let earned_per_address_data = $derived.by(() => {
		let earned_mapping: { [key: string]: number } = {};

		$info.data.bidWons.forEach((entry) => {
			if (entry.data.bidder in earned_mapping) {
				earned_mapping[entry.data.winner] += aptos_to_decimal(Number(entry.data.bid_price));
			} else {
				earned_mapping[entry.data.winner] = aptos_to_decimal(Number(entry.data.bid_price));
			}
		});

		return {
			labels: Object.keys(earned_mapping),
			values: Object.values(earned_mapping)
		};
	});

	let spend_per_task = $derived.by(() => {
		let counter = {
			//"Text Generation": 0,
			//"Image Generation": 0,
		};

		// map request id to task type
		let task_type_mapper: { [key: number]: string } = {};
		db_data.forEach((entry) => {
			task_type_mapper[entry.request_id] = entry.task_type;
		});

		// now accumulate spend
		$info.data.bidWons.forEach((entry) => {
			if (!task_type_mapper[entry.data.request_id]) {
				task_type_mapper[entry.data.request_id] = 'Text Generation';
			}
			if (task_type_mapper[entry.data.request_id] in counter) {
				counter[task_type_mapper[entry.data.request_id]] += aptos_to_decimal(
					Number(entry.data.bid_price)
				);
			} else {
				counter[task_type_mapper[entry.data.request_id]] = aptos_to_decimal(
					Number(entry.data.bid_price)
				);
			}
		});

		return {
			labels: Object.keys(counter),
			values: Object.values(counter)
		};
	});

	let average_cost_per_task = $derived.by(() => {
		let counter = {
			//"Text Generation": 0,
			//"Image Generation": 0,
		};

		let per_task_counter = {};

		// map request id to task type
		let task_type_mapper: { [key: number]: string } = {};
		db_data.forEach((entry) => {
			task_type_mapper[entry.request_id] = entry.task_type;
		});

		// now accumulate spend
		$info.data.bidWons.forEach((entry) => {
			if (!task_type_mapper[entry.data.request_id]) {
				task_type_mapper[entry.data.request_id] = 'Text Generation';
			}

			if (task_type_mapper[entry.data.request_id] in counter) {
				counter[task_type_mapper[entry.data.request_id]] += aptos_to_decimal(
					Number(entry.data.bid_price)
				);
				per_task_counter[task_type_mapper[entry.data.request_id]] += 1;
			} else {
				counter[task_type_mapper[entry.data.request_id]] = aptos_to_decimal(
					Number(entry.data.bid_price)
				);

				per_task_counter[task_type_mapper[entry.data.request_id]] = 1;
			}
		});

		let avg_costs = {};
		Object.keys(per_task_counter).forEach((label) => {
			avg_costs[label] = counter[label] / per_task_counter[label];
		});

		return {
			labels: Object.keys(avg_costs),
			values: Object.values(avg_costs)
		};
	});

	$inspect(average_cost_per_task);

	// ---------- CHART CONTROLS ----------
	const chart_data_points = [
		{
			label: 'Historical Requests',
			description: 'Number of requests for work received per day'
		},
		{
			label: 'Work Requests per User',
			description: 'Number of work requests submitted per address'
		},
		{
			label: 'Bids per Worker',
			description: 'Number of bids submitted per worker' // number of bids submitted, and successful bid
		},
		{
			label: 'Spend per Address',
			description: 'Total spent in Aptos per address for work requests'
		},
		{
			label: 'Earned per Address',
			description: 'Total earned in Aptos per worker'
		},
		{
			label: 'Spend per Task',
			description: 'Total spent in Aptos per task type'
		},
		{
			label: 'Average Cost per Task',
			description: 'Average Cost in Aptos per task type'
		}
	];

	let current_chart_settings = $state(chart_data_points[0]);

	// ---------- CHART DATA & SETTINGS ----------
	let chart_options = $derived.by(() => {
		switch (current_chart_settings.label) {
			case 'Historical Requests':
				return {
					chart: {
						type: 'line'
					},
					colors: ['#c7d2fe', '#B2F041', '#F02900'],
					series: [
						{
							name: 'Requests',
							data: historical_requests_data.count_both //[30, 40, 35, 38]
						},
						{
							name: 'Successful Requests',
							data: historical_requests_data.success //[25, 32, 31, 37]
						},
						{
							name: 'Failed Requests',
							data: historical_requests_data.failed //[5, 8, 4, 1]
						}
					],
					xaxis: {
						categories: historical_requests_data.labels //[1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
					},
					legend: {
						show: true,
						position: 'top',
						floating: false
					},
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return val;
						}
					}
				};
			case 'Work Requests per User':
				return {
					chart: {
						type: 'bar',
						stacked: true
					},
					colors: ['#B2F041', '#F02900'],
					series: [
						{
							name: 'Successful Requests',
							data: work_request_per_user.success //  [30, 40, 35, 50, 49, 60, 70, 91, 125]
						},
						{
							name: 'Failed Requests',
							data: work_request_per_user.failed //  [30, 40, 35, 50, 49, 60, 70, 91, 125]
						}
					],
					xaxis: {
						categories: work_request_per_user.labels, //[1, 1992, 1993, 5, 1995, 1996, 1997, 1998, 1999],
						labels: {
							show: false
						}
					},
					legend: {
						show: true,
						position: 'top',
						floating: false
					},
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return val;
						}
					}
				};
			case 'Bids per Worker':
				return {
					chart: {
						type: 'bar'
					},
					colors: ['#c7d2fe'],
					series: [
						{
							name: 'Bids',
							data: bids_per_worker_data.values // [30, 40, 35, 50, 49, 60, 70, 91, 125]
						}
					],
					xaxis: {
						categories: bids_per_worker_data.labels, // [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
						labels: {
							show: false
						}
					},
					legend: {
						show: false,
						position: 'top',
						floating: false
					},
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return val;
						}
					}
				};
			case 'Spend per Address':
				return {
					chart: {
						type: 'bar'
					},
					colors: ['#c7d2fe'],
					series: [
						{
							name: 'Spend',
							data: spend_per_address_data.values //[30, 40, 35, 50, 49, 60, 70, 91, 125]
						}
					],
					xaxis: {
						categories: spend_per_address_data.labels, //[1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
						labels: {
							show: false
						}
					},
					legend: {
						show: false,
						position: 'top',
						floating: false
					},
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return val;
						}
					}
				};

			case 'Earned per Address':
				return {
					chart: {
						type: 'bar'
					},
					colors: ['#c7d2fe'],
					series: [
						{
							name: 'Earned',
							data: earned_per_address_data.values //[0.25, 0.1, 0.005, 1.5, 2.0, 1, 0.002, 0.4, 2]
						}
					],
					xaxis: {
						categories: earned_per_address_data.labels, //['0x12548aefgrdfssd', 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
						labels: {
							show: false
						}
					},
					legend: {
						show: false,
						position: 'top',
						floating: false
					},
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return val;
						}
					}
				};

			case 'Spend per Task':
				return {
					chart: {
						type: 'pie'
					},
					colors: ['#41F0A9', '#F0BA41', '#41D5F0', '#F09041', '#5D919B'],
					series: spend_per_task.values, //[44, 55, 41, 17],
					labels: spend_per_task.labels, //['Text Generation', 'Image Generation', 'Voice Generation', 'ZK Proof'],
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							return spend_per_task.labels[
								opt.seriesIndex
							];
						}
					},
					legend: {
						show: false,
						position: 'top',
						floating: false
					},
					responsive: [
						{
							breakpoint: 480,
							options: {
								chart: {
									width: 200
								},
								legend: {
									position: 'bottom'
								}
							}
						}
					]
				};

			case 'Average Cost per Task':
				return {
					chart: {
						type: 'pie'
					},
					colors: ['#41F0A9', '#F0BA41', '#41D5F0', '#F09041', '#5D919B'],
					series: average_cost_per_task.values, // [44, 55, 41, 17],
					labels: average_cost_per_task.labels, //['Text Generation', 'Image Generation', 'Voice Generation', 'ZK Proof'],
					dataLabels: {
						enabled: true,
						formatter: function (val, opt) {
							//{ seriesIndex, dataPointIndex, w }) {
							//return w.config.series[seriesIndex].name + ":  " + val
							//return opt.seriesLabel

							return average_cost_per_task.labels[opt.seriesIndex];
						}
					},
					legend: {
						show: false,
						position: 'top',
						floating: false
					},
					responsive: [
						{
							breakpoint: 480,
							options: {
								chart: {
									width: 200
								},
								legend: {
									position: 'bottom'
								}
							}
						}
					]
				};

			default:
				throw new Error('Unimplemented chart type');
		}
	});

	function change_chart(chart_target) {
		current_chart_settings = chart_target;
	}
</script>

<svelte:head>
	<title>ProxiRun Analytics</title>
	<meta name="description" content="Analytics for ProxiRun, the decentralized compute marketplace on Aptos" />
</svelte:head>

<div class="grid grid-rows gap-8 p-16">
	<div class="grid grid-cols-4 gap-8">
		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Data Provider</Card.Title>
				<Card.Description>This dashboard is powered by Nodit</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<NoditLogo />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Requests Received</Card.Title>
				<Card.Description>Number of requests received by ProxiRun</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">{nb_requests_received}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Requests Successful</Card.Title>
				<Card.Description>Number of requests that were picked up by workers</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">{nb_requests_successful}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Total Spend</Card.Title>
				<Card.Description
					>Amount spent by users to get their requests processed (in Aptos)</Card.Description
				>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class=" flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">APT {aptos_to_decimal(total_spend)}</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid grid-cols-4 gap-8">
		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Number of Users</Card.Title>
				<Card.Description>Number of unique users who requested work</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">{nb_users}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Number of Providers</Card.Title>
				<Card.Description>Number of unique providers who bid on auctions</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">{nb_providers}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Total Earned by Providers</Card.Title>
				<Card.Description>Total amount earned by providers, in Aptos</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class="flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">APT {aptos_to_decimal(total_spend)}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class=" flex flex-col">
			<Card.Header>
				<Card.Title>Requests Unsuccessful</Card.Title>
				<Card.Description>Number of requests which did not received bids</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				<div class=" flex items-center justify-center h-full">
					<p class="font-semibold text-2xl">{nb_requests_unsuccessful}</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid grid-cols-8 gap-8">
		<Card.Root class=" col-span-6">
			<Card.Header>
				<Card.Title>{current_chart_settings.label}</Card.Title>
				<Card.Description>{current_chart_settings.description}</Card.Description>
			</Card.Header>
			<Card.Content>
				<div use:chart={chart_options}></div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="col-span-2">
			<Card.Header>
				<Card.Title>Chart Controls</Card.Title>
				<Card.Description>Choose a datapoint to display</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col space-y-8 items-center">
				{#each chart_data_points as cdp}
					<Button
						variant="secondary"
						class="w-full max-w-[250px] items-center py-6"
						onclick={() => change_chart(cdp)}>{cdp.label}</Button
					>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
