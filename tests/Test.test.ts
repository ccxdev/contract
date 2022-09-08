import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Task", () => {
    async function fixture() {
        const [owner, beneficiary, otherAccount] = await ethers.getSigners();

        const Task = await ethers.getContractFactory("Task");
        const task = await Task.deploy(beneficiary.address, { value: 10000 });
        const taskWithoutBalance = await Task.deploy(beneficiary.address);

        return { owner, beneficiary, otherAccount, task, taskWithoutBalance };
    }

    it("Should be positive balance", async () => {
        const { task } = await loadFixture(fixture);

        expect(await task.getBalance()).to.equal(10000);
    });

    it("Should set the right beneficiary", async () => {
        const { task, beneficiary } = await loadFixture(fixture);

        expect(await task.beneficiary()).to.equal(beneficiary.address);
    });

    it("Should be reverted with reason 'Only owner could call this'", async () => {
        const { task, beneficiary, otherAccount } = await loadFixture(fixture);

        await expect(task.connect(otherAccount).changeBeneficiary(beneficiary.address)).to.be.revertedWith(
            "Only owner could call this"
        );
    });

    it("Should change beneficiary", async () => {
        const { task, otherAccount } = await loadFixture(fixture);

        await task.changeBeneficiary(otherAccount.address);
        expect(await task.beneficiary()).to.equal(otherAccount.address);
    });

    it("Should emit BeneficiaryChanged ", async () => {
        const { task, beneficiary, otherAccount } = await loadFixture(fixture);

        await expect(await task.changeBeneficiary(otherAccount.address))
            .to.emit(task, "BeneficiaryChanged")
            .withArgs(beneficiary.address, otherAccount.address);
    });

    it("Should return token balance", async () => {
        // TODO
    });

    it("Should recieve deposit", async () => {
        const { task } = await loadFixture(fixture);

        await expect(task.deposit(100)).to.emit(task, "DepositAccepted").withArgs(99);
    });

    it("Should beneficiary recieve fee", async () => {
        const { task } = await loadFixture(fixture);

        await expect(task.deposit(99)).to.emit(task, "ComissionSendedToBeneficiary").withArgs(0);
        await expect(task.deposit(100)).to.emit(task, "ComissionSendedToBeneficiary").withArgs(1);
        await expect(task.deposit(1000)).to.emit(task, "ComissionSendedToBeneficiary").withArgs(20);
        await expect(task.deposit(10000)).to.emit(task, "ComissionSendedToBeneficiary").withArgs(300);
    });

    it("Should not beneficiary recieve fee because of empty balance", async () => {
        const { taskWithoutBalance } = await loadFixture(fixture);

        await expect(taskWithoutBalance.deposit(10000)).to.emit(taskWithoutBalance, "ComissionSendedToBeneficiary").to
            .be.reverted;
    });
});