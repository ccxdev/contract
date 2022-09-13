import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Task", () => {
    async function fixture() {
        const [owner, beneficiary, ...addresses] = await ethers.getSigners();

        const tokens = ["USDT", "HGP", "SCAL", "FALL"].map(async (name) => {
            const factory = await ethers.getContractFactory("TetherToken");

            return await factory.deploy(10000000, name, `${name} Token`, 8);
        });

        const Task = await ethers.getContractFactory("Task");
        const task = await Task.connect(owner).deploy(beneficiary.address, {
            value: 100000,
        });

        const taskWithoutBalance = await Task.deploy(beneficiary.address);

        await (await tokens[0]).transfer(addresses[1].address, 10000);

        return {
            owner,
            beneficiary,
            task,
            taskWithoutBalance,
            tokens,
            addresses,
        };
    }

    it("Should be positive balance", async () => {
        const { task } = await loadFixture(fixture);

        expect(await task.getBalance()).to.equal(100000);
    });

    it("Should set the right beneficiary", async () => {
        const { task, beneficiary } = await loadFixture(fixture);

        expect(await task.beneficiary()).to.equal(beneficiary.address);
    });

    it("Should be reverted with reason 'Only owner could call this'", async () => {
        const { task, addresses } = await loadFixture(fixture);

        await expect(
            task.connect(addresses[0]).changeBeneficiary(addresses[1].address)
        ).to.be.revertedWith("Only owner could call this");
    });

    it("Should change beneficiary", async () => {
        const { task, addresses } = await loadFixture(fixture);

        await task.changeBeneficiary(addresses[0].address);
        expect(await task.beneficiary()).to.equal(addresses[0].address);
    });

    it("Should emit BeneficiaryChanged ", async () => {
        const { task, beneficiary, addresses } = await loadFixture(fixture);

        await expect(await task.changeBeneficiary(addresses[0].address))
            .to.emit(task, "BeneficiaryChanged")
            .withArgs(beneficiary.address, addresses[0].address);
    });

    it("Should return one token balance", async () => {
        const { task, tokens, addresses } = await loadFixture(fixture);

        const balance = await task.getTokenBalance(
            addresses[0].address,
            (
                await tokens[0]
            ).address
        );

        expect(balance).to.be.eq(0);
    });

    it("Should return token balances", async () => {
        const { task, tokens, addresses } = await loadFixture(fixture);
        const balances = await task.getBalancesByTokens(addresses[1].address, [
            (await tokens[0]).address,
            (await tokens[1]).address,
            (await tokens[2]).address,
        ]);

        expect(balances[0]).to.eq(10000);
        expect(balances[1]).to.eq(0);
        expect(balances[2]).to.eq(0);
    });

    it("Should recieve deposit", async () => {
        const { task } = await loadFixture(fixture);

        await expect(task.deposit(100))
            .to.emit(task, "DepositAccepted")
            .withArgs(
                99,
                (
                    await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
                ).timestamp
            );
    });

    it("Should beneficiary recieve deposit fee", async () => {
        const { task, beneficiary } = await loadFixture(fixture);

        let afterTxBalance;
        let afterTxTaskBalance;
        let taskBalance = await task.getBalance();
        let beneficiaryBalance = await beneficiary.getBalance();

        // 1st tx
        await expect(task.deposit(99))
            .to.emit(task, "CommissionSentToBeneficiary")
            .withArgs(0);
        expect(beneficiaryBalance).eq(beneficiaryBalance);
        expect(taskBalance).eq(taskBalance);

        // 2nd tx
        taskBalance = await task.getBalance();
        beneficiaryBalance = await beneficiary.getBalance();
        await expect(task.deposit(100))
            .to.emit(task, "CommissionSentToBeneficiary")
            .withArgs(1);
        afterTxBalance = await beneficiary.getBalance();
        afterTxTaskBalance = await task.getBalance();
        expect(afterTxBalance).eq(beneficiaryBalance.add(1));
        expect(afterTxTaskBalance).eq(taskBalance.sub(1));

        // 3rd tx
        taskBalance = await task.getBalance();
        beneficiaryBalance = await beneficiary.getBalance();
        await expect(task.deposit(1000))
            .to.emit(task, "CommissionSentToBeneficiary")
            .withArgs(20);
        afterTxBalance = await beneficiary.getBalance();
        afterTxTaskBalance = await task.getBalance();
        expect(afterTxBalance).eq(beneficiaryBalance.add(20));
        expect(afterTxTaskBalance).eq(taskBalance.sub(20));

        // 4th tx
        taskBalance = await task.getBalance();
        beneficiaryBalance = await beneficiary.getBalance();
        await expect(task.deposit(10000))
            .to.emit(task, "CommissionSentToBeneficiary")
            .withArgs(300);
        afterTxBalance = await beneficiary.getBalance();
        afterTxTaskBalance = await task.getBalance();
        expect(afterTxBalance).eq(beneficiaryBalance.add(300));
        expect(afterTxTaskBalance).eq(taskBalance.sub(300));
    });

    it("Should not beneficiary recieve fee because of empty balance", async () => {
        const { taskWithoutBalance } = await loadFixture(fixture);

        await expect(taskWithoutBalance.deposit(10000)).to.emit(
            taskWithoutBalance,
            "CommissionSentToBeneficiary"
        ).to.be.reverted;
    });
});
